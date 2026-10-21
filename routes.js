// Converts a database row into exactly what the contract promises
const toThing = (row) => ({
  id: row.id,
  title: row.title,
  dueDate: row.due_date ? new Date(row.due_date).toISOString() : null,
});

// GET /things/:id
router.get('/things/:id', async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, title, due_date FROM things WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Thing not found' });
  }
  res.status(200).json(toThing(rows[0]));
});