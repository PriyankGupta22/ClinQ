// A deliberately limited in-memory adapter at Mongoose's execution boundary.
// Real Query/Aggregate construction runs; MongoDB execution and population do not.
// Unknown operators fail loudly instead of silently making a test pass.
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

const valueAt = (row, path) => path.split('.').reduce((value, key) => value?.[key], row);
const scalar = value => value instanceof mongoose.Types.ObjectId ? String(value) :
    value instanceof Date ? value.getTime() : value;
const equal = (left, right) => scalar(left) === scalar(right);

export function matches(row, filter) {
    return Object.entries(filter).every(([key, expected]) => {
        if (key === '$or') return expected.some(part => matches(row, part));
        if (key.startsWith('$')) throw new Error(`Unsupported filter: ${key}`);
        const actual = valueAt(row, key);
        if (expected && expected.constructor === Object) {
            return Object.entries(expected).every(([operator, value]) => {
                if (operator === '$gte') return scalar(actual) >= scalar(value);
                if (operator === '$lt') return scalar(actual) < scalar(value);
                if (operator === '$in') return value.some(item => equal(actual, item));
                if (operator === '$ne') return !equal(actual, value);
                throw new Error(`Unsupported predicate: ${operator}`);
            });
        }
        return equal(actual, expected);
    });
}

function expression(expr, row) {
    if (typeof expr === 'string' && expr.startsWith('$')) return valueAt(row, expr.slice(1));
    if (Array.isArray(expr)) return expr.map(item => expression(item, row));
    if (!expr || expr.constructor !== Object) return expr;
    if ('$switch' in expr) {
        for (const branch of expr.$switch.branches) {
            if (expression(branch.case, row)) return expression(branch.then, row);
        }
        return expression(expr.$switch.default, row);
    }
    if ('$and' in expr) return expr.$and.every(item => expression(item, row));
    if ('$gte' in expr) {
        const [a, b] = expression(expr.$gte, row);
        return scalar(a) >= scalar(b);
    }
    if ('$lt' in expr) {
        const [a, b] = expression(expr.$lt, row);
        return scalar(a) < scalar(b);
    }
    if ('$ne' in expr) {
        const [a, b] = expression(expr.$ne, row);
        return !equal(a, b);
    }
    if ('$in' in expr) {
        const [a, values] = expression(expr.$in, row);
        return values.some(b => equal(a, b));
    }
    if ('$cond' in expr) {
        const [condition, yes, no] = expr.$cond;
        return expression(expression(condition, row) ? yes : no, row);
    }
    return Object.fromEntries(Object.entries(expr).map(([key, value]) => {
        if (key.startsWith('$')) throw new Error(`Unsupported expression: ${key}`);
        return [key, expression(value, row)];
    }));
}

export function pipeline(rows, stages) {
    for (const stage of stages) {
        const [operator, spec] = Object.entries(stage)[0];
        if (operator === '$match') rows = rows.filter(row => matches(row, spec));
        else if (operator === '$count') rows = rows.length ? [{ [spec]: rows.length }] : [];
        else if (operator === '$limit') rows = rows.slice(0, spec);
        else if (operator === '$sort') rows = [...rows].sort((a, b) => {
            for (const [key, direction] of Object.entries(spec)) {
                const left = scalar(valueAt(a, key)), right = scalar(valueAt(b, key));
                if (left !== right) return (left < right ? -1 : 1) * direction;
            }
            return 0;
        });
        else if (operator === '$facet') rows = [Object.fromEntries(
            Object.entries(spec).map(([key, stages]) => [key, pipeline(rows, stages)]))];
        else if (operator === '$group') {
            const groups = new Map();
            for (const row of rows) {
                const _id = expression(spec._id, row);
                const key = JSON.stringify(_id);
                if (!groups.has(key)) groups.set(key, { _id });
                const group = groups.get(key);
                for (const [field, accumulator] of Object.entries(spec)) {
                    if (field === '_id') continue;
                    assert.deepEqual(Object.keys(accumulator), ['$sum']);
                    group[field] = (group[field] ?? 0) + expression(accumulator.$sum, row);
                }
            }
            rows = [...groups.values()];
        } else throw new Error(`Unsupported stage: ${operator}`);
    }
    return rows;
}

function project(row, fields) {
    if (!row) return null;
    const keys = typeof fields === 'string' ? fields.split(/\s+/) :
        Object.keys(fields ?? {}).filter(key => fields[key] === 1);
    if (!keys.length) return { ...row };
    return Object.fromEntries(['_id', ...keys].filter(key => key in row).map(key => [key, row[key]]));
}

export function installDatabaseMock(mock, state) {
    const execute = (model, operation, scope) => {
        state.calls.push({ model, operation, scope });
        if (state.failure?.model === model && state.failure.operation === operation) {
            throw new Error('PRIVATE_DATABASE_FAILURE_SENTINEL');
        }
        assert(state.data[model], `Unexpected model: ${model}`);
    };
    mock.method(mongoose.Query.prototype, 'exec', async function () {
        const model = this.model.modelName;
        const filter = this.cast(this.model);
        execute(model, this.op, filter);
        let rows = state.data[model].filter(row => matches(row, filter));
        if (this.op === 'countDocuments') return rows.length;
        assert(['find', 'findOne'].includes(this.op));
        if (this.options.sort) rows.sort((a, b) => {
            for (const [key, direction] of Object.entries(this.options.sort)) {
                const left = scalar(valueAt(a, key));
                const right = scalar(valueAt(b, key));
                if (left !== right) return (left < right ? -1 : 1) * direction;
            }
            return 0;
        });
        if (this.options.limit) rows = rows.slice(0, this.options.limit);
        rows = rows.map(row => project(row, this._fields));
        for (const populate of Object.values(this._mongooseOptions.populate ?? {})) {
            const target = this.model.schema.path(populate.path).options.ref;
            rows = rows.map(row => {
                const related = state.data[target].find(item => equal(item._id, row[populate.path]) &&
                    matches(item, populate.match ?? {}));
                return { ...row, [populate.path]: project(related, populate.select) };
            });
        }
        return this.op === 'findOne' ? rows[0] ?? null : rows;
    });
    mock.method(mongoose.Aggregate.prototype, 'exec', async function () {
        const model = this.model().modelName;
        const stages = this.pipeline();
        execute(model, 'aggregate', stages[0].$match);
        // Aggregation scopes must already be actual ObjectIds.
        for (const key of ['clinicId', 'doctorId', 'userId']) {
            if (key in stages[0].$match) assert(stages[0].$match[key] instanceof mongoose.Types.ObjectId);
        }
        return pipeline(state.data[model], stages);
    });
}
