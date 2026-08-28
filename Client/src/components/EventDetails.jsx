import {
  Calendar,
  MapPin,
  Clock3,
  Trophy,
  ShieldCheck,
  Info
} from "lucide-react";

const schedule = [
  ["7:30 AM", "Reporting & verification"],
  ["8:00 AM", "Opening ceremony"],
  ["8:30 AM", "Competition begins"],
  ["After finals", "Prize distribution ceremony"],
];

const rules = [
  "Carry your registration confirmation and valid ID/RSFI card where applicable.",
  "Report before your event time and follow officials’ instructions.",
  "Helmets and required protective equipment are compulsory during competition.",
  "The decision of the judges and organising committee will be final.",
];

const instructions = [
  "Please arrive at least 30 minutes before your reporting time.",
  "Parents/guardians are responsible for participants before and after their event.",
  "Keep personal belongings secure; organisers are not responsible for loss or damage.",
  "Event timings may change due to weather or operational requirements.",
];

export default function EventDetails() {
  return (
    <section className="event-section" id="details">

      <div className="details-heading">
        <span>CHAMPIONSHIP DETAILS</span>
        <h2>Everything you need for race day</h2>
        <p>The 1st Agra Regional Skating Championship brings young skaters together to compete, learn, and celebrate the spirit of roller sports.</p>
      </div>

      <div className="event-card">

        <div className="event-item">
          <Calendar size={28} className="event-icon" />

          <div>
            <p className="label">Event Date</p>
            <h3>6 September 2026</h3>
          </div>
        </div>

        <div className="event-item">
          <MapPin size={28} className="event-icon" />

          <div>
            <p className="label">Venue</p>
            <h3>JAWAHAR BAGH PARK, MATHUR</h3>
          </div>
        </div>

        <div className="event-item">
          <Clock3 size={28} className="event-icon" />

          <div>
            <p className="label">Reporting Time</p>
            <h3>7:30 AM</h3>
          </div>
        </div>

        <div className="event-item">
          <Trophy size={28} className="event-icon" />

          <div>
            <p className="label">Categories</p>
            <h3>Inline, Quad &amp; Adjustable Toy Skate</h3>
          </div>
        </div>

      </div>

      <div className="details-grid">
        <article className="details-panel schedule-panel">
          <h3><Clock3 size={21} /> Competition Schedule</h3>
          <ol className="event-schedule">
            {schedule.map(([time, activity]) => <li key={time}><time>{time}</time><span>{activity}</span></li>)}
          </ol>
        </article>

        <article className="details-panel">
          <h3><ShieldCheck size={21} /> Event Rules</h3>
          <ul className="details-list">{rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
        </article>

        <article className="details-panel important-instructions-panel">
          <h3><Info size={21} /> Important Instructions</h3>
          <ul className="details-list">{instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul>
        </article>

      </div>

    </section>
  );
}
