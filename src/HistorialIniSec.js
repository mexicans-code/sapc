import React, { useState, useEffect } from 'react';
import { Container, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from './Header';
import NavBar from './NavBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf'; 
import HeaderComponent from './HeaderComponent.js';

const HistorialIniSec = ({ userType = 1 }) => {
  const [showAll, setShowAll] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate(); 

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No se encontró el token en el localStorage');
      }

      const API_URL = "https://gateway-41642489028.us-central1.run.app";

      console.log('Intentando conectar a:', `${API_URL}/usuarios/historial`);
      
      const response = await axios.get(`${API_URL}/usuarios/historial`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Respuesta del servidor:', response);
      
      const historialFormateado = response.data.historial.map(item => {
        const fecha = new Date(item.fecha);
        return {
          ...item,
          fechaStr: item.fechaStr || fecha.toLocaleDateString(),
          horaStr: item.horaStr || fecha.toLocaleTimeString(),
          nombre: item.nombre || "Desconocido",
          estado: item.estado || "Desconocido"
        };
      });

      setHistorial(historialFormateado);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar el historial. ' + (error.response?.data?.mensaje || error.message));
      setLoading(false);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDownloadReport = () => {
    if (historial.length === 0) {
      alert('No hay datos disponibles para descargar.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Historial de Inicio de Sesión', 20, 20);

    doc.setFontSize(12);
    doc.text('Fecha', 20, 30);
    doc.text('Hora', 50, 30);
    doc.text('Usuario', 90, 30);
    doc.text('Estado', 150, 30);

    let y = 40;
    historial.forEach((item) => {
      const fecha = item.fechaStr || "Sin fecha";
      const hora = item.horaStr || "Sin hora";
      const usuario = item.nombre || "Desconocido";
      const estado = item.estado === "exitoso" ? "Exitoso" : "Fallido";

      doc.text(fecha, 20, y);
      doc.text(hora, 50, y);
      doc.text(usuario, 90, y);
      doc.text(estado, 150, y);
      y += 10;
    });

    doc.save('historial_inicio_sesion.pdf');
  };

  const visibleHistorial = showAll ? historial : historial.slice(0, 10);

  return (
    <div className="bootstrap-container">
      {userType === 2 ? <Header userType={2} /> : <NavBar userType={1} />}

      <style>
        {`
          .table td, .table th {
            padding: 2rem; 
            font-size: 18px; 
          }

          .table th {
            background-color: #f8f9fa;
          }

          .table td {
            vertical-align: middle;
          }

          .table {
            width: 25%;
            min-width: 800px;
            max-height: 500px; 
            overflow-y: auto; 
          }

          .container-lg {
            max-width: 90%;
          }

          .text-center {
            text-align: center;
          }
        `}
      </style>

      {userType === 1 && (
        <div className="main-content">
          <header className="header">
            <HeaderComponent />
          </header>
        </div>
      )}

      <Container className="mt-4 container-lg">
        <h3 className="text-center">Historial de inicio de sesión</h3>
      </Container>

      <Container className="mt-4 container-lg">
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive">
            <Table bordered hover striped className="table table-lg">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistorial.map((item, index) => (
                  <tr key={index}>
                    <td>{item.fechaStr}</td>
                    <td>{item.horaStr}</td>
                    <td>{item.nombre}</td>
                    <td>
                      {item.estado === "exitoso" ? (
                        <span className="text-success">
                          <i className="fas fa-check-circle me-1"></i> Exitoso
                        </span>
                      ) : (
                        <span className="text-danger">
                          <i className="fas fa-times-circle me-1"></i> Fallido
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {historial.length > 10 && (
        <Container className="mt-4 text-center">
          <Button
            style={{ backgroundColor: "#E1E1E1", borderColor: "#E1E1E1", color: "#000" }}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Ver Menos" : "Ver Más"}
          </Button>
        </Container>
      )}

      <Container className="mt-4 text-center">
        <Button onClick={handleDownloadReport} variant="primary">
          Descargar Reporte PDF
        </Button>
      </Container>
    </div>
  );
};

export default HistorialIniSec;
