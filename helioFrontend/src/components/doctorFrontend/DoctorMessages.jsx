import ConversationMessages from "../ConversationMessages";
import { useDoctorClinic } from "./DoctorClinicContext";

export default function DoctorMessages() {
  const { selectedClinicId } = useDoctorClinic();
  return <ConversationMessages role="doctor" selectedClinicId={selectedClinicId} />;
}
