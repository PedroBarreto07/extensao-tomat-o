import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/quote', (req, res) => {
  res.json({
    content: 'A vida é como um código: sempre dá pra melhorar.',
    author: 'Pedro'
  });
});

// Só inicia o servidor se não for teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
  });
}

export default app;
