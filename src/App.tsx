import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import Map from './pages/Map';

function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Rotas para Leituristas
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ p: 0 }}>
        <Map />
      </Container>
    </>
  );
}

export default App;
