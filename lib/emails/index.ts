// TODO(ucb-23m): add snapshot tests for rendered output once Vitest baseline lands.

export {
  renderShowConfirmationBody,
  renderShowConfirmationSubject,
  injectDriveFolderUrl,
  DRIVE_FOLDER_PLACEHOLDER,
  type ShowConfirmationInput,
} from "./show-confirmation"

export {
  renderShowCancelledBody,
  renderShowCancelledSubject,
  type ShowCancelledInput,
} from "./show-cancelled"

export {
  renderAsssscatBody,
  renderAsssscatSubject,
  ASSSSCAT_TO,
  ASSSSCAT_VENUE,
  ASSSSCAT_CONTACT_PHONE,
  ASSSSCAT_CALL_TIME,
  ASSSSCAT_ARRIVAL_TIME,
  ASSSSCAT_COMPS_EMAIL,
  ASSSSCAT_SIGNATURE,
  ASSSSCAT_MAX_IMPROVISERS,
  ASSSSCAT_SMALL_CAST_THRESHOLD,
  type AsssscatEmailInput,
} from "./asssscat"
