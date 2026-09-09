import Dexie from 'dexie'

const db = new Dexie('TaskFlowDB')

db.version(1).stores({
  users: '++id, &username',
  todos: '++id, userId, text, completed, dueDate, order'
})

export default db
