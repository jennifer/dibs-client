import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchUserReservationData,
  showModal,
  hideModal,
  showSelectedReservation,
  clearSelectedReservation,
  clearSelectedProperty,
  deleteReservation
} from "../actions/protected-data";
import requiresLogin from "./Requires-login";
import Ribbon from "./Ribbon";
import BigCalendar from "react-big-calendar";
import moment from "moment";
import ReactModal from "react-modal";
import Close from "react-icons/lib/io/close-round";
import Trash from "react-icons/lib/ti/trash";
import "../stylesheets/dashboard.css";
import "../stylesheets/modal.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

if (process.env.NODE_ENV !== "test") ReactModal.setAppElement("#root");

class Dashboard extends Component {
  componentWillMount() {
    this.props.dispatch(fetchUserReservationData(this.props.username));
    this.props.dispatch(clearSelectedProperty());
  }

  handleSelectEvent(event) {
    this.props.dispatch(showModal());
    this.props.dispatch(showSelectedReservation(event));
  }

  handleCloseModal() {
    this.props.dispatch(hideModal());
    this.props.dispatch(clearSelectedReservation());
  }

  handleDeleteRes(user, id, reservation) {
    this.props.dispatch(deleteReservation(id, reservation));
    this.props.dispatch(hideModal());
    this.props.dispatch(fetchUserReservationData(user));
    this.props.history.push("/dashboard");
  }

  render() {
    let events = this.props.reservations.map((reservation, index) => {
      return {
        id: `${reservation.id}`,
        title: `${reservation.propertyName}`,
        guest: `${reservation.username}`,
        start: new Date(reservation.start),
        end: new Date(reservation.end),
        resourceId: index
      };
    });

    let reservations = this.props.reservations.map((reservation, index) => (
      <div key={index}>
        <div className="active-res-property">{reservation.propertyName}</div>{" "}
        <div className="active-res-time">
          {moment(reservation.start).format("MMM Do")} -{" "}
          {moment(reservation.end).format("MMM Do")}
        </div>
      </div>
    ));

    let reservationData;

    // check if any active reservations exist and if not display a message rather than leaving the space empty

    if (this.props.reservations.length === 0) {
      reservationData = (
        <p className="active-res-message">
          You do not have any active reservations
        </p>
      );
    }

    return (
      <div className="dashboard">
        <div className="welcome-message">
          <h2>Welcome {this.props.username}</h2>
        </div>
        <div className="dashboard-container">
          <div className="dashboard-protected-data">
            <Ribbon heading="Active Reservations" subheading="" />
            {reservationData}
            {reservations}
            <Link className="reservations-button" to="/reservations">
              Reserve a Property
            </Link>
          </div>
          <div className="dashboard-calendar-container">
            <BigCalendar
              events={events}
              views={["month"]}
              onSelectEvent={event => this.handleSelectEvent(event)}
            />
          </div>
          <ReactModal
            className="modal-content"
            overlayClassName="modal-overlay"
            isOpen={this.props.showModal}
            contentLabel="Reservation Details"
          >
            <h2>{this.props.selectedReservation.title}</h2>
            <p>
              <strong>
                {this.props.selectedReservation.guest} has reserved this
                property
              </strong>
            </p>
            <p>
              <strong>From:</strong>
              &nbsp;&nbsp;&nbsp;
              {moment(this.props.selectedReservation.start).format("dddd, ")}
              &nbsp;{" "}
              {moment(this.props.selectedReservation.start).format("MMM Do")}
            </p>
            <p>
              <strong>To:</strong>
              &nbsp;&nbsp;&nbsp;
              {moment(this.props.selectedReservation.end).format("dddd, ")}
              &nbsp;{" "}
              {moment(this.props.selectedReservation.end).format("MMM Do")}
            </p>
            <button
              className="modal-button"
              aria-label="close"
              onClick={() => this.handleCloseModal()}
            >
              <Close />
            </button>
            <button
              className="delete-res-button"
              aria-label="delete"
              onClick={() =>
                this.handleDeleteRes(
                  this.props.selectedReservation.guest,
                  this.props.selectedReservation.id,
                  this.props.reservations
                )
              }
            >
              <Trash />
            </button>
          </ReactModal>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { currentUser } = state.auth;
  return {
    username: state.auth.currentUser.username,
    name: `${currentUser.firstName} ${currentUser.lastName}`,
    properties: state.protectedData.properties,
    reservations: state.protectedData.reservations,
    showModal: state.protectedData.showModal,
    selectedReservation: state.protectedData.selectedReservation
  };
};

export default requiresLogin()(connect(mapStateToProps)(Dashboard));
