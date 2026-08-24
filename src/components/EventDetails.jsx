import {
  Calendar,
  MapPin,
  Clock3,
  Trophy
} from "lucide-react";

export default function EventDetails() {
  return (
    <section className="event-section">

      <h2 className="event-heading">
        Championship Details
      </h2>

      <div className="event-card">

        <div className="event-item">
          <Calendar size={28} className="event-icon" />

          <div>
            <p className="label">Event Date</p>
            <h3>15 September 2026</h3>
          </div>
        </div>

        <div className="event-item">
          <MapPin size={28} className="event-icon" />

          <div>
            <p className="label">Venue</p>
            <h3>Mathura, Uttar Pradesh</h3>
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
            <h3>All Age Groups</h3>
          </div>
        </div>

      </div>

    </section>
  );
}