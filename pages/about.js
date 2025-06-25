import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="about-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>About Rev X Rent</h1>
        <p>Learn about our mission, values, and commitment to excellence</p>
      </div>

      {/* Company Introduction */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-text">
            <h2>Welcome to Rev X Rent</h2>
            <p>
              Rev X Rent is your premier destination for car rentals, offering a wide range of vehicles for every journey. We are committed to providing an exceptional rental experience with convenience, reliability, and customer satisfaction at our core.
            </p>
            <p>
              Our platform is designed to make your rental journey seamless and enjoyable, with a focus on quality vehicles, competitive prices, and outstanding customer service.
            </p>
          </div>
          <div className="about-image">
            <img 
              src="/images/Icon.png" 
              alt="Rev X Rent" 
              className="rounded-image"
            />
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <div className="mission-statement">
            <p>
              "To provide customers with a seamless rental experience, offering quality vehicles at competitive prices while maintaining the highest standards of customer service and satisfaction."
            </p>
          </div>
          <div className="mission-values">
            <div className="value-card">
              <h3>Quality</h3>
              <p>We carefully select and curate our vehicles to ensure the highest standards of quality.</p>
            </div>
            <div className="value-card">
              <h3>Customer Focus</h3>
              <p>Your satisfaction is our priority, and we strive to exceed your expectations.</p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>We continuously improve our platform to provide the best rental experience.</p>
            </div>
            <div className="value-card">
              <h3>Reliability</h3>
              <p>We are committed to delivering on our promises with consistency and dependability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Why Choose Us</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">
              <img src="https://via.placeholder.com/200x200?text=Quality" alt="Quality" />
            </div>
            <h3>Quality Vehicles</h3>
            <p className="member-title">Carefully Selected</p>
            <p className="member-bio">
              We source and select vehicles that meet our high standards of quality and reliability.
            </p>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src="https://via.placeholder.com/200x200?text=Service" alt="Service" />
            </div>
            <h3>Excellent Service</h3>
            <p className="member-title">Customer First</p>
            <p className="member-bio">
              Our dedicated team is committed to providing outstanding customer service and support.
            </p>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src="https://via.placeholder.com/200x200?text=Delivery" alt="Delivery" />
            </div>
            <h3>Fast Delivery</h3>
            <p className="member-title">Quick & Reliable</p>
            <p className="member-bio">
              We ensure prompt and reliable delivery of your rentals to your doorstep.
            </p>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src="https://via.placeholder.com/200x200?text=Support" alt="Support" />
            </div>
            <h3>24/7 Support</h3>
            <p className="member-title">Always Available</p>
            <p className="member-bio">
              Our customer support team is available round the clock to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="history-section">
        <h2>How It Works</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-date">Step 1</div>
            <div className="timeline-content">
              <h3>Lease</h3>
              <p>Choose to lease a vehicle directly from the company.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Step 2</div>
            <div className="timeline-content">
              <h3>Select</h3>
              <p>Opt for a vehicle during your checkout process.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Step 3</div>
            <div className="timeline-content">
              <h3>Deliver</h3>
              <p>Use our vehicles for your rental needs.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Step 4</div>
            <div className="timeline-content">
              <h3>Return</h3>
              <p>Customers return the vehicle to a central hub.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Step 5</div>
            <div className="timeline-content">
              <h3>Recycle</h3>
              <p>The company manages reverse logistics to facilitate recycling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta-section">
        <div className="cta-content">
          <h2>Join Our Mobility Journey</h2>
          <p>Experience the future of mobility with our innovative car rental system.</p>
          <div className="cta-buttons">
            <Link href="/catalog">
              <button className="btn-primary">Get Started</button>
            </Link>
            <Link href="/contact">
              <button className="btn-outline">Contact Us</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 