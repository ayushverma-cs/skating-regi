import { useEffect, useState } from "react";
import { Download, FileText, Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const csvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function Admin() {
  const [password, setPassword] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [ageGroup, setAgeGroup] = useState("All");
  const [category, setCategory] = useState("All");
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("adminToken") || "");

  const loadRegistrations = async (token) => {
    const response = await fetch(`${API_URL}/api/registration/admin`, { headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Unable to load registrations.");
    setRegistrations(result.registrations);
  };

  useEffect(() => {
    if (!adminToken || registrations.length) return;
    setLoading(true);
    loadRegistrations(adminToken).catch((err) => {
      sessionStorage.removeItem("adminToken"); setAdminToken(""); setError(err.message);
    }).finally(() => setLoading(false));
  }, [adminToken, registrations.length]);

  const load = async (event) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/registration/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to sign in.");
      setAdminToken(result.token); sessionStorage.setItem("adminToken", result.token); setRegistrations(result.registrations || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const openDocument = async (type, filePath) => {
    const documentWindow = window.open("", "_blank");
    try {
      if (!documentWindow) throw new Error("Your browser blocked the document tab. Please allow pop-ups for this site.");
      const name = filePath?.split("/").filter(Boolean).pop();
      if (!name) throw new Error("Document is unavailable.");
      const response = await fetch(`${API_URL}/api/registration/admin/document/${type}/${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!response.ok) throw new Error(response.status === 404 ? "This document is no longer available on the server." : "Unable to open document.");
      const url = URL.createObjectURL(await response.blob()); documentWindow.location.replace(url); setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) { documentWindow?.close(); setError(err.message); }
  };

  const categories = ["All", ...new Set(registrations.map((item) => item.category).filter(Boolean))];
  const registrationsInCategory = category === "All" ? registrations : registrations.filter((item) => item.category === category);
  const ages = ["All", ...new Set(registrationsInCategory.map((item) => item.ageGroup).filter(Boolean))];
  const visible = registrationsInCategory.filter((item) => `${item.fullName} ${item.fatherName} ${item.email || ""} ${item.registrationId} ${item.mobile}`.toLowerCase().includes(query.toLowerCase()) && (ageGroup === "All" || item.ageGroup === ageGroup));
  const handleCategoryChange = (event) => { setCategory(event.target.value); setAgeGroup("All"); };

  const exportCsv = () => {
    const headers = ["Registration ID", "Name", "Father's Name", "DOB", "Age Group", "Gender", "Category", "Races", "Mobile", "Email", "Club / School", "Coach / Teacher", "Region", "Payment Status", "Amount", "Submitted On"];
    const rows = visible.map((item) => [item.registrationId, item.fullName, item.fatherName, item.dob ? new Date(item.dob).toLocaleDateString("en-CA") : "", item.ageGroup, item.gender, item.category, item.races?.join(", "), item.mobile, item.email, item.club, item.coachName, item.state, item.paymentStatus, item.amountPaid, item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : ""]);
    const csv = [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${category === "All" ? "all-categories" : category.toLowerCase().replaceAll(" ", "-")}-${ageGroup === "All" ? "all-ages" : ageGroup.replaceAll(" ", "-")}-registrations.csv`;
    link.click(); URL.revokeObjectURL(url);
  };

  return <main className="admin-page">
    <section className="admin-header"><p className="hero-badge">ADMINISTRATION</p><h1>Registered Students</h1><p>Choose a skating category, then an age group, and download exactly those registrations.</p></section>
    <form className="admin-login" onSubmit={load}><label htmlFor="admin-password">Admin password</label><div><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="button-primary" disabled={loading}>{loading ? "Loading..." : "View registrations"}</button></div>{error && <p className="error-text">{error}</p>}</form>
    {registrations.length > 0 && <section className="admin-table-wrap">
      <div className="admin-table-title"><div><h2>Students</h2><span>{visible.length} of {registrations.length} registrations</span></div><button className="csv-button" onClick={exportCsv}><Download size={17} /> Download filtered CSV</button></div>
      <div className="admin-filters">
        <label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, father name, ID or mobile" /></label>
        <select aria-label="Filter by skating category" value={category} onChange={handleCategoryChange}>{categories.map((item) => <option key={item} value={item}>{item === "All" ? "All skating categories" : item}</option>)}</select>
        <select aria-label="Filter by age group within the selected category" value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}>{ages.map((item) => <option key={item} value={item}>{item === "All" ? "All age groups in this category" : item}</option>)}</select>
      </div>
      <div className="table-scroll"><table className="admin-table"><thead><tr><th>ID</th><th>Participant details</th><th>Contact &amp; club</th><th>Documents</th><th>Payment</th></tr></thead><tbody>{visible.map((student) => {
        const docs = [["candidates", student.candidatePhoto, "Photo"], ["documents", student.aadhaarCard, "Aadhaar"], ["documents", student.dobCertificate, "DOB certificate"], ["payments", student.paymentScreenshot, "Payment screenshot"]].filter(([, file]) => file);
        return <tr key={student._id}><td>{student.registrationId}</td><td><strong>{student.fullName}</strong><small className="admin-subtext">Father: {student.fatherName}</small><small className="admin-subtext">DOB: {student.dob ? new Date(student.dob).toLocaleDateString("en-IN") : "—"} · {student.ageGroup}</small><small className="admin-subtext">{student.gender} · {student.category} · {student.races?.join(", ")}</small></td><td>{student.mobile}<small className="admin-subtext">{student.email || "—"}</small><small className="admin-subtext">{student.club}{student.coachName ? ` · ${student.coachName}` : ""}</small></td><td><div className="document-links">{docs.map(([type, file, label]) => <button key={label} type="button" onClick={() => openDocument(type, file)}><FileText size={14} /> {label}</button>)}</div></td><td><span className={`payment-status ${(student.paymentStatus || "pending").toLowerCase().replaceAll(" ", "-")}`}>{student.paymentStatus || "Pending"}</span><small className="admin-subtext">₹{student.amountPaid || 0}</small></td></tr>;
      })}</tbody></table></div>
    </section>}
  </main>;
}
