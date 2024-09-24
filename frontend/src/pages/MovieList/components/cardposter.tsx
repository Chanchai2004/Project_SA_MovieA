import React, { useState, useEffect } from 'react';
import { Button, Card, Modal, Row, Col, Typography } from 'antd';
import './CardShowPoster.css';
import { GetMovieById } from "../../../services/https/index";
import { MoviesInterface } from "../../../interfaces/IMovie";
import { ClockCircleOutlined, VideoCameraOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface CardShowPosterProps {
  movieID: string;
}

const CardShowPoster: React.FC<CardShowPosterProps> = ({ movieID }) => {
  const navigate = useNavigate(); // move it inside the component
  const posterUrl = `http://localhost:8000/api/movie/${movieID}/poster`;

  const [movie, setMovie] = useState<MoviesInterface | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieData = await GetMovieById(movieID);
        if (movieData) {
          setMovie(movieData);
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    fetchMovie();
  }, [movieID]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Card for displaying movie poster */}
      
      <Card className="text-center card-custom" onClick={showModal} cover={
        <img
          src={posterUrl}
          alt={`Poster for movie ID: ${movieID}`}
          className="poster-img"
        />
      }>
      
      <Card.Meta title={<span style={{ color: 'white' }}>{movie?.MovieName || "Loading..."}</span>} />

      </Card>
      

      {/* Modal for displaying movie details */}
      {movie && (
        <Modal
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
        >
          <div className="carousel-container" style={{ padding: "20px" }}>
            <Row gutter={[16, 16]} align="top">
              {/* Left section: Movie details */}
              <Col xs={24} md={12}>
                <div style={{ paddingRight: "20px", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div>
                    <Title level={2}>{movie.MovieName}</Title>
                    <Paragraph>
                      <ClockCircleOutlined style={{ marginRight: '8px' }} />
                      <strong>Duration:</strong> {movie.MovieDuration} minutes
                    </Paragraph>
                    {movie.MovieType && (
                      <Paragraph>
                        <VideoCameraOutlined style={{ marginRight: '8px' }} />
                        <strong>Type:</strong> {movie.MovieType}
                      </Paragraph>
                    )}
                    {movie.Director && (
                      <Paragraph>
                        <UserOutlined style={{ marginRight: '8px' }} />
                        <strong>Director:</strong> {movie.Director}
                      </Paragraph>
                    )}
                    {movie.Actor && (
                      <Paragraph>
                        <UserOutlined style={{ marginRight: '8px' }} />
                        <strong>Actors:</strong> {movie.Actor}
                      </Paragraph>
                    )}
                    {movie.ReleaseDate && (
                      <Paragraph>
                        <CalendarOutlined style={{ marginRight: '8px' }} />
                        <strong>Release Date:</strong> {new Date(movie.ReleaseDate).toLocaleDateString()}
                      </Paragraph>
                    )}
                  </div>

                  {/* Scrollable synopsis */}
                  <div style={{ flexGrow: 1, overflowY: "auto", maxHeight: "300px" }}>
                    <Paragraph>{movie.Synopsis}</Paragraph>
                  </div>

                  <div style={{ marginTop: "auto", textAlign: "center", width: "100%" }}>
                    <Button
                      type="primary"
                      onClick={() => {
                        console.log('Selected Movie ID:', movie.ID);  // Print the movie ID to the console
                        navigate('/moviebooking', { state: { movieID: movie.ID } });  // Navigate to the booking page
                      }}
                      block
                      size="large"
                      style={{ backgroundColor: "#ffcc00", borderColor: "#ffcc00", color: "black" }}  // Change button color to yellow
                    >
                      Booking
                    </Button>
                  </div>
                </div>
              </Col>

              {/* Right section: Movie poster */}
              <Col xs={24} md={12}>
                <img
                  src={posterUrl}
                  alt={movie.MovieName}
                  style={{ width: "100%", maxHeight: "750px", objectFit: "cover", borderRadius: "15px" }}
                />
              </Col>
            </Row>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CardShowPoster;
