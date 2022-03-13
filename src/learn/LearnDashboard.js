// /* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { init } from "pell";
import API from "@aws-amplify/api";
import classNames from "classnames";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Slide from "@material-ui/core/Slide";
import Dialog from "@material-ui/core/Dialog";
import { I18n } from "@aws-amplify/core";
import { errorToast, successToast } from "../libs/toasts";
import PaywallModal from "./PaywallModal";
import ExperienceSummary from "./ExperienceSummary";
import "pell/dist/pell.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * This is the Learning Dashboard page, where the student sees their experience summaries (for navigation in mobile view) and the notepad, which they can use to take down notes and which will one day be expanded into a Roam-like daily notes system, into the ParetOS family of services.
 * @TODO Issue #32
 * @TODO Issue #55
 */

function LearnDashboard(props) {
  const [note, setNote] = useState("");
  const editor = null;
  const [html, setHtml] = useState(null);
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    init({
      element: document.getElementById("editor"),
      onChange: (html) => setHtml({ html }),
      actions: ["bold", "underline", "italic"],
    });
  }, []);

  useEffect(() => {
    setNote(props.user.notes[0]);
  }, []);

  function handleRichChange(value) {
    setNote(value);
  }

  async function editNote() {
    setNoteLoading(true);

    try {
      await API.put("pareto", `/users/${props.user.id}`, {
        body: {
          notes: [note],
        },
      });
      setNoteLoading(false);
      successToast("Your journal was saved.");
    } catch (e) {
      errorToast(e, props.user);
    }
  }
  return (
    <div>
      <h1>{I18n.get("apprenticeship")}</h1>
      <div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
        <div
          className="col-xs-12 col-sm-4"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <h2>{I18n.get("myMentors")}</h2>
          <div className="exp-cards" style={{ justifyContent: "start" }}>
            {props.coaches.map((coach) => (
              <div
                className="exp-card"
                style={{ display: "flex", justifyContent: "flex-start" }}
                key={coach._id}
              >
                <img
                  src={coach.mentor.picture}
                  height="50"
                  width="50"
                  alt="Profile"
                />
                <p style={{ marginTop: 14, paddingLeft: 10 }}>
                  {" "}
                  {coach.mentor.fName} {coach.mentor.lName}
                </p>
              </div>
            ))}
          </div>
          <div>
            <h2>{I18n.get("myCareer")}</h2>

            <div
              style={{ marginLeft: -4 }}
              className={classNames("context-cards-start")}
            >
              <ExperienceSummary {...props.training} history={props.history} />
              <ExperienceSummary {...props.product} history={props.history} />
              <ExperienceSummary
                {...props.interviewing}
                history={props.history}
              />
            </div>
          </div>
        </div>
        <div className="col-xs-12 col-sm-8" style={{ marginTop: 20 }}>
          <FormGroup controlId="note" bsSize="large" className="overflow">
            {/* <ReactQuill
              value={note}
              onChange={handleRichChange}
              style={{ font: 20 }}
              onBlur={editNote}
            /> */}
            <h3>Editor</h3>
            <div id="editor" className="pell" />
            <h3>HTML Output</h3>
            <div id="html-output">{html}</div>
          </FormGroup>
        </div>
      </div>
      <Dialog
        style={{
          margin: "auto",
        }}
        open={props.user.learningPurchase === false}
        TransitionComponent={Transition}
        keepMounted
        disableEscapeKeyDown
        disableBackdropClick
        hideBackdrop={false}
        aria-labelledby="loading"
        aria-describedby="Please wait while the page loads"
      >
        <PaywallModal {...props} open={props.user.learningPurchase} />
      </Dialog>
    </div>
  );
}

export default LearnDashboard;
