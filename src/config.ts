// Inbox that receives the "Solicită o analiză" requests.
// firestore.rules only accepts messages to this exact address, so change it there too
// (the build fails if the two don't match).
export const CONTACT_FORM_TO = 'office@evocati-legal.ro'
