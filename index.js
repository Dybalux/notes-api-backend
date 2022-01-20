const { response } = require('express')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

let notes = [
	{
		id: 1,
		content: 'Te con menta',
		date: '2022-01-20T12:45:12.1234',
		important: true,
	},
	{
		id: 2,
		content: 'Cafe',
		date: '2022-01-21T12:05:12.1234',
		important: true,
	},
	{
		id: 3,
		content: 'Mate',
		date: '2022-01-22T11:45:12.1234',
		important: true,
	},
]

app.get('/', (request, response) => {
	response.send('<h1>Hola mundo!</h1>')
})

app.get('/api/notes', (request, response) => {
	response.json(notes)
})
app.get('/api/notes/:id', (request, response) => {
	//recibe todas las notas
	const id = Number(request.params.id)
	//recibe la id de nota que necesitamos
	const note = notes.find((note) => note.id === id)
	///muestra la nota
	if (note) {
		response.json(note)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/notes/:id', (request, response) => {
	const id = Number(request.params.id)
	notes = notes.filter((note) => note.id !== id)

	response.status(204).end()
})

app.post('/api/notes', (request, response) => {
	const note = request.body

	if (!note || !note.content) {
		return response.status(400).json({
			error: 'note.content is missing',
		})
	}

	const ids = notes.map((note) => note.id)
	const maxId = Math.max(...ids)
	const newNote = {
		id: maxId + 1,
		content: note.content,
		important: typeof note.important !== 'undefined' ? note.important : false,
		date: new Date(),
	}

	notes = [...notes, newNote]

	response.status(201).json(newNote)
})

app.use((request,response) => {
	response.status(404).json({
		error: 'Not found',
	})
})

const PORT = 3001

app.listen(PORT, () => {
	console.log(`Server running on por ${PORT}`)
})