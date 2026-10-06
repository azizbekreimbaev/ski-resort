# Events implementation and client handoff

Events are an approved extension beyond the unchanged DMM, implemented in the API's existing NestJS resolver/service/module architecture. The explicit MongoDB collection is `events`.

## Data and behavior

Required fields: `eventTitle`, `eventDesc`, `eventImages` (1–5 distinct uploaded paths), `eventStartDate`, `eventEndDate`, `eventStatus`, server-derived creator `memberId`, and timestamps. `eventLocation` and `resortId` are nullable. Title/description/location are trimmed; supplied strings must be nonblank. Status is DRAFT by default or PUBLISHED. End must be strictly after start; timestamps use GraphQL DateTime and past Events are allowed.

Anyone can list/read PUBLISHED Events. Draft detail is reported as not found publicly. Published past Events remain visible; no expiration job runs. Every admin operation checks both the existing ADMIN role guard and the current database ACTIVE ADMIN state. Any active admin can manage any Event; updates cannot change the creator.

Supplied Resort associations must reference an ACTIVE or SOLD_OUT Resort. Clearing a Resort/location with null is supported. Resort deletion does not cascade to Events; reads preserve retained IDs without joining Resort or Member records.

Updates write only supplied content/status fields. Omitted status does not reset to DRAFT. When either date changes, the service validates the resulting pair and matches both previously read dates in the update predicate. A concurrent change/removal returns a conflict requiring reload/retry. Empty updates and null required fields are rejected. Removal permanently deletes the document and returns it; uploaded files remain.

## GraphQL operations

| Operation | Access | Return |
|---|---|---|
| `getEvent(eventId: String!)` | Public, PUBLISHED only | Event |
| `getEvents(input: EventsInquiry!)` | Public, PUBLISHED only | Events |
| `getEventByAdmin(eventId: String!)` | ACTIVE ADMIN | Event |
| `getAllEventsByAdmin(input: AllEventsInquiry!)` | ACTIVE ADMIN | Events |
| `createEvent(input: EventInput!)` | ACTIVE ADMIN | Event |
| `updateEventByAdmin(input: EventUpdate!)` | ACTIVE ADMIN | Event |
| `removeEventByAdmin(eventId: String!)` | ACTIVE ADMIN | Removed Event |
| `uploadEventImages(files: [Upload!]!)` | ACTIVE ADMIN | `[String!]!` |

Both list inquiries require page >= 1 and limit 1–100. Optional search includes `text` (literal case-insensitive title/description substring) and `resortId`; admin search also accepts `eventStatus`. Sorts are `createdAt`, `updatedAt`, `eventStartDate`; default is createdAt DESC with an `_id` tie-breaker. Existing Direction enum values are ASC/DESC. Results contain `list` and `metaCounter { total }`; empty results have empty arrays.

Upload 1–5 PNG/JPEG files first. Existing middleware enforces 15,000,000 bytes per file. Paths are returned in input order under `uploads/events`. If a file fails, the entire mutation fails after settling all uploads and cleaning files created by that request. Generic imageUploader/imagesUploader reject the `events` namespace (including nested/case variants); other targets retain their behavior. Create/update only accept safe direct Event image paths backed by existing regular files. Draft records are hidden, but image URLs use the existing public static storage. Unattached/replaced/deleted image files are retained; no garbage collector is added.

### Create and publish

```graphql
mutation CreateEvent($input: EventInput!) {
  createEvent(input: $input) {
    _id eventTitle eventDesc eventImages eventStatus
    eventStartDate eventEndDate eventLocation resortId memberId
  }
}
```

Variables (replace the image path with a successful upload result):

```json
{
  "input": {
    "eventTitle": "Winter opening weekend",
    "eventDesc": "Join our opening celebration.",
    "eventImages": ["uploads/events/RETURNED_IMAGE.jpg"],
    "eventStartDate": "2026-12-05T00:00:00.000Z",
    "eventEndDate": "2026-12-06T09:00:00.000Z",
    "eventStatus": "PUBLISHED",
    "eventLocation": "Main plaza"
  }
}
```

```graphql
query Events($input: EventsInquiry!) {
  getEvents(input: $input) {
    list { _id eventTitle eventImages eventStartDate eventEndDate }
    metaCounter { total }
  }
}
# Variables: {"input":{"page":1,"limit":10,"sort":"eventStartDate","direction":"ASC"}}

mutation UpdateEvent($input: EventUpdate!) {
  updateEventByAdmin(input: $input) { _id eventTitle eventStatus resortId }
}
# Variables: {"input":{"_id":"EVENT_ID","eventTitle":"Updated title","resortId":null}}

mutation RemoveEvent($eventId: String!) {
  removeEventByAdmin(eventId: $eventId) { _id }
}
# Variables: {"eventId":"EVENT_ID"}
```

### Multipart upload

Postman: POST to the configured `/graphql` endpoint, add `Authorization: Bearer <admin token>`, and use form-data fields below. Let Postman set the multipart Content-Type boundary. Add `Apollo-Require-Preflight: true` for Apollo multipart requests.

| Field | Kind | Value |
|---|---|---|
| operations | Text | `{"query":"mutation Upload($files:[Upload!]!){uploadEventImages(files:$files)}","variables":{"files":[null,null]}}` |
| map | Text | `{"0":["variables.files.0"],"1":["variables.files.1"]}` |
| 0 | File | First PNG/JPEG |
| 1 | File | Second PNG/JPEG |

For one image, use one null entry and map/file field 0. Maximum is five images per mutation and Event.

## Validation boundaries

Fresh checks are recorded in [completed tasks](COMPLETED_TASKS.md). Tests use mocked persistence, generated GraphQL schemas and temporary filesystem fixtures. They do not establish live MongoDB aggregation/concurrency correctness, complete bootstrap or deployed behavior. No frontend, booking/registration/payment integration, social interactions, migration, installed-index changes or deployment is included.
