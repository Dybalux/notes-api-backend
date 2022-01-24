require("dotenv").config();
require("./mongo");

const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const express = require("express");
const app = express();
const cors = require("cors");
const Note = require("./models/Note");
const { request, response } = require("express");
const notFound = require("./middleware/notFound");
const handleErrors = require("./middleware/handleErrors");

app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'))

Sentry.init({
  dsn: "https://94ae107199fb478fb3458d16db38b36f@o1124962.ingest.sentry.io/6163409",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

let notes = [];

app.get("/", (request, response) => {
  console.log(request.ip)
  console.log(request.ips)
  console.log(request.originalUrl)
  response.send("<h1><br>Hola mundo!</br></h1>");
});

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});
app.get("/api/notes/:id", (request, response, next) => {
  //recibe todas las notas
  const { id } = request.params;

  Note.findById(id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((err) => {
      next(err);
    });
});

app.put("/api/notes/:id", (request, response, next) => {
  const { id } = request.params;
  const note = request.body;

  const newNoteInfo = {
    content: note.content,
    important: note.important,
  };

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then((result) => {
      response.json(result);
    })
    .catch(next);
});

app.delete("/api/notes/:id", (request, response, next) => {
  const { id } = request.params;

  Note.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end();
    })
    .catch(next());

  response.status(204).end();
});

app.post("/api/notes", (request, response, next) => {
  const note = request.body;

  if (!note.content) {
    return response.status(400).json({
      error: 'requiered "content" field is missing',
    });
  }

  const newNote = Note({
    content: note.content,
    date: new Date(),
    import: note.important || false,
  });

  newNote
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((err) => next(err));
});

app.use(notFound);

app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on por ${PORT}`);
});
