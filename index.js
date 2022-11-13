const express = require('express')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send("Hello, World! with BARI BGF [WITH NEW CONFIG]")
})

app.listen(port, () => {console.log(`Server running on port: ${port}`)})
