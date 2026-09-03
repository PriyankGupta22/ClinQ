import QueueEntry from "../models/QueueEntity.model.js";
import Doctor from "../models/Doctor.model.js";

export const recalculateQueue = async (
    clinicId,
    doctorId,
    date
) => {
    try {

        // --------------------------------------------------
        // 1. Get today's date range
        // --------------------------------------------------

        const start = new Date(date);

        start.setHours(0, 0, 0, 0);

        const end = new Date(start);

        end.setDate(end.getDate() + 1);


        // --------------------------------------------------
        // 2. Get all queue entries in queue order
        // --------------------------------------------------

        const queueEntries = await QueueEntry.find({
            clinicId,
            doctorId,
            date: {
                $gte: start,
                $lt: end
            }
        }).sort({
            queueNumber: 1
        });


        if (!queueEntries.length) {
            return [];
        }


        // --------------------------------------------------
        // 3. Get doctor
        // --------------------------------------------------

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            throw new Error("Doctor not found");
        }


        const appointmentDuration =
            Number(
                doctor.schedule.appointmentDuration
            );


        if (
            !appointmentDuration ||
            appointmentDuration <= 0
        ) {
            throw new Error(
                "Invalid appointment duration"
            );
        }


        // --------------------------------------------------
        // 4. Find currently consulting patient
        // --------------------------------------------------

        const currentConsultation =
            queueEntries.find(
                entry =>
                    entry.status === "consulting"
            );


        // --------------------------------------------------
        // 5. Find the latest completed consultation
        // --------------------------------------------------

        const completedEntries =
            queueEntries
                .filter(
                    entry =>
                        entry.status === "completed" &&
                        entry.consultationEndedAt
                )
                .sort(
                    (a, b) =>
                        new Date(b.consultationEndedAt) -
                        new Date(a.consultationEndedAt)
                );


        const latestCompleted =
            completedEntries[0];


        // --------------------------------------------------
        // 6. Determine timeline anchor
        // --------------------------------------------------

        let previousEndTime = null;


        /*
         * CASE 1
         *
         * A consultation is currently running.
         *
         * The actual consultation start time becomes
         * the source of truth.
         */

        if (
            currentConsultation &&
            currentConsultation.consultationStartedAt
        ) {

            const consultationStart =
                new Date(
                    currentConsultation.consultationStartedAt
                );


            const expectedEnd =
                new Date(consultationStart);


            expectedEnd.setMinutes(
                expectedEnd.getMinutes() +
                appointmentDuration
            );


            const now = new Date();


            /*
             * If the consultation is already taking
             * longer than the fixed duration, use NOW
             * as the temporary expected end.
             *
             * Example:
             *
             * Fixed = 20 min
             * Started = 10:00
             * Expected = 10:20
             * Now = 10:27
             *
             * Waiting patients should be calculated
             * from 10:27, not 10:20.
             */

            previousEndTime =
                now > expectedEnd
                    ? now
                    : expectedEnd;


            // Current patient
            currentConsultation.estimatedStartTime =
                consultationStart;


            /*
             * This is still an estimate.
             * Actual end will be saved when admin
             * clicks complete consultation.
             */

            currentConsultation.estimatedEndTime =
                expectedEnd;


            currentConsultation.estimatedWaitingTime = 0;


            await currentConsultation.save();
        }


        /*
         * CASE 2
         *
         * No consultation is currently running,
         * but someone has already completed.
         *
         * The next patient's timeline starts from
         * the actual end of the last consultation.
         */

        else if (
            latestCompleted &&
            latestCompleted.consultationEndedAt
        ) {

            previousEndTime =
                new Date(
                    latestCompleted.consultationEndedAt
                );
        }


        // --------------------------------------------------
        // 7. Recalculate waiting patients
        // --------------------------------------------------

        const now = new Date();


        for (const entry of queueEntries) {

            // ----------------------------------------------
            // Completed patients
            // ----------------------------------------------

            if (
                entry.status === "completed"
            ) {
                continue;
            }


            // ----------------------------------------------
            // Cancelled patients
            // ----------------------------------------------

            if (
                entry.status === "cancelled"
            ) {
                continue;
            }


            // ----------------------------------------------
            // Current consulting patient
            // ----------------------------------------------

            if (
                entry.status === "consulting"
            ) {
                continue;
            }


            // ----------------------------------------------
            // Determine start time
            // ----------------------------------------------

            let estimatedStartTime;


            /*
             * If there is already a timeline anchor,
             * this patient starts immediately after it.
             */

            if (previousEndTime) {

                estimatedStartTime =
                    new Date(previousEndTime);

            }

            /*
             * If nobody has started consultation yet,
             * use the patient's original appointment time.
             */

            else {

                estimatedStartTime =
                    new Date(
                        entry.appointmentTime
                    );
            }


            // ----------------------------------------------
            // Calculate estimated end
            // ----------------------------------------------

            const estimatedEndTime =
                new Date(
                    estimatedStartTime
                );


            estimatedEndTime.setMinutes(
                estimatedEndTime.getMinutes() +
                appointmentDuration
            );


            // ----------------------------------------------
            // Save calculated values
            // ----------------------------------------------

            entry.estimatedStartTime =
                estimatedStartTime;


            entry.estimatedEndTime =
                estimatedEndTime;


            entry.estimatedWaitingTime =
                Math.max(
                    0,
                    Math.ceil(
                        (
                            estimatedStartTime.getTime() -
                            now.getTime()
                        ) /
                        (1000 * 60)
                    )
                );


            await entry.save();


            // ----------------------------------------------
            // This patient becomes the new anchor
            // ----------------------------------------------

            previousEndTime =
                estimatedEndTime;
        }


        return queueEntries;


    } catch (error) {

        console.log(
            "Error in recalculating queue:",
            error
        );

        throw error;
    }
};