export default function ProfilePage({ identity, request, response }) {
  const path =
    identity === "clinic" ? "/api/cliniAuthRoutes/clinicMe" : "/api/auth/me";
  return (
    <PageTitle eyebrow="Account" title="Your profile">
      <div className="profile-card">
        <div className="profile-avatar">
          {identity === "clinic" ? "C" : "P"}
        </div>
        <div>
          <p className="eyebrow">Authenticated {identity}</p>
          <h2>Identity details</h2>
          <button className="primary" onClick={() => request("get", path)}>
            Fetch profile
          </button>
        </div>
      </div>
      <Response data={response} />
    </PageTitle>
  );
}
export function PageTitle({ eyebrow, title, children }) {
  return (
    <>
      <div className="content-heading">
        <div>
          <p className="eyebrow">Healio / {eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>
      {children}
    </>
  );
}
export function Response({ data }) {
  return (
    <div className="response">
      <p className="eyebrow">Latest response</p>
      <pre>
        {data
          ? JSON.stringify(data, null, 2)
          : "Your API response will appear here."}
      </pre>
    </div>
  );
}
