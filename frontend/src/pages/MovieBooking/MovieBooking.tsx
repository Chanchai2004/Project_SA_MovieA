import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import Slider from "react-slick";
import { Button, Card } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./MovieBooking.css";
import { GetShowtimes, GetMovieById } from "../../services/https/index"; // Import API calls
import { MoviesInterface } from "../../interfaces/IMovie"; // Import movie interface
import Navbar from "../../components/navbar/navbar";

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div className="slick-prev-arrow" onClick={onClick} style={{ color: 'white' }}>
      {'<'}
    </div>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div className="slick-next-arrow" onClick={onClick} style={{ color: 'white' }}>
      {'>'}
    </div>
  );
};

const MovieBooking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // use navigate inside component
  const { movieID } = location.state || {}; // Extract movieID from location.state

  const [selectedDate, setSelectedDate] = useState<number | null>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // New state for selected time
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [filteredTimes, setFilteredTimes] = useState<string[]>([]);
  const [movie, setMovie] = useState<MoviesInterface | null>(null); // State for movie details
  const [moviePoster, setMoviePoster] = useState<string | null>(null);
  const [movieDuration, setMovieDuration] = useState<string>("");
  const [director, setDirector] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [movieType, setMovieType] = useState<string>("");
  const [synopsis, setSynopsis] = useState<string>("No synopsis available");

  // Fetch movie data from API using movieID
  const fetchMovieData = async () => {
    try {
      if (movieID) {
        const movieData: MoviesInterface = await GetMovieById(movieID); // Fetch the movie by ID
        if (movieData) {
          const posterUrl = `http://localhost:8000/api/movie/${movieData.ID}/poster`;
          setMoviePoster(posterUrl);

          const durationInMinutes = movieData.MovieDuration;
          const hours = Math.floor(durationInMinutes / 60);
          const minutes = durationInMinutes % 60;
          setMovieDuration(`${hours} hr ${minutes} min`);

          setDirector(movieData.Director || "Unknown Director");
          setMovieType(movieData.MovieType || "Unknown Genre");
          setRating(Math.floor(Math.random() * (10 - 6 + 1)) + 6); // Random rating between 6 and 10
          setSynopsis(movieData.Synopsis || "No synopsis available");
          setMovie(movieData); // Set the movie details
        }
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
    }
  };

  useEffect(() => {
    fetchMovieData(); // Fetch movie data when the component mounts or movieID changes
  }, [movieID]);

  // Fetch showtimes from the API
  useEffect(() => {
    if (movieID) {
      GetShowtimes()
        .then((data) => {
          setShowtimes(data); // Set showtimes data
        })
        .catch((error) => {
          console.error("Error fetching showtimes:", error);
        });
    }
  }, [movieID]);

  // Filter showtimes by date and movie
  useEffect(() => {
    if (showtimes.length > 0 && movie) {
      const selectedMomentDate = moment()
        .add(selectedDate || 0, "days")
        .format("YYYY-MM-DD");
      const filtered = showtimes
        .filter((showtime) => {
          const showdate = moment(showtime.Showdate).format("YYYY-MM-DD");
          return (
            showtime.Movie.MovieName === movie.MovieName &&
            showdate === selectedMomentDate
          );
        })
        .map((showtime) => moment(showtime.Showdate).format("HH:mm"));

      setFilteredTimes(filtered);
    }
  }, [showtimes, selectedDate, movie]);

  // Generate array of dates (today + 10 days)
  const dates = Array.from({ length: 10 }, (_, index) =>
    moment().add(index, "days")
  );

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  if (!movieID) {
    return <div>No movie selected.</div>;
  }

  // Function to navigate to seat booking on button click
  const handleSelectSeat = async () => {
    try {
      const selectedDateFormatted = moment()
        .add(selectedDate || 0, "days")
        .format("YYYY-MM-DD");
      const showtime = showtimes.find(
        (st) =>
          moment(st.Showdate).format("YYYY-MM-DD") === selectedDateFormatted && // ตรวจสอบวันที่
          moment(st.Showdate).format("HH:mm") === selectedTime && // ตรวจสอบเวลาที่ตรง
          st.MovieID === movie?.ID // ตรวจสอบ MovieID ที่ต้องตรงกับ ID ของหนังที่เลือก
      );

      if (showtime) {
        const showtimeID = showtime.ID;
        const TheaterID = showtime.TheaterID;
        console.log("Showtime ID:", showtimeID);
        navigate("/seatbooking", { state: { movieID,showtimeID, TheaterID } });
      } else {
        console.error("Showtime not found");
      }
    } catch (error) {
      console.error("Error navigating to seat booking:", error);
    }
  };

  return (
    <div>
      <div className="mnavbar">
        <Navbar />
      </div>
      <div className="mcontainer">
        {/* Left Side: Movie Poster */}
        <div className="poster-container">
          <Card
            style={{
              padding: "0",
              margin: "0",
              display: "flex",
              justifyContent: "center",
              border: "none",
              backgroundColor: "black",
            }}
          >
            {moviePoster ? (
              <img src={moviePoster} alt="Movie Poster" />
            ) : (
              <p>No Poster Available</p>
            )}
          </Card>
        </div>

        {/* Right Side: Movie Information */}
        <div className="movie-info">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#FFD700" }}>
            {movie?.MovieName ? movie.MovieName : "No Movie Selected"}
          </h2>
          <div className="flex items-center space-x-4 mb-4">
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
              {movieType}
            </span>
            <span className="flex items-center">
              <ClockCircleOutlined className="w-4 h-4 mr-1" /> {movieDuration}
            </span>
            <span className="flex items-center">
              <UserOutlined className="w-4 h-4 mr-1" /> {director}
            </span>
            <span className="flex items-center">
              <StarOutlined className="w-4 h-4 mr-1" /> {rating}
            </span>
          </div>

          {/* Date Slider */}
          <div className="date-slider mb-4">
            <Slider {...settings}>
              {dates.map((date, index) => (
                <div key={index} style={{ marginLeft: "10px" }}>
                  <Card
                    className={`date-card ${
                      selectedDate === index ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDate(index)}
                  >
                    <div className="date-text">{date.format("DD")}</div>
                    <div className="date-month">
                      {date.format("MMM").toUpperCase()}
                    </div>
                  </Card>
                </div>
              ))}
            </Slider>
          </div>

          {/* Showtimes */}
          <Card className="mb-4">
            <Card.Meta title="Round" />
            <div className="grid grid-cols-3 gap-2 mt-4">
              {filteredTimes.length > 0 ? (
                filteredTimes.map((time) => {
                  const selectedMomentDate = moment()
                    .add(selectedDate || 0, "days")
                    .format("YYYY-MM-DD");
                  const showtimeMoment = moment(
                    `${selectedMomentDate} ${time}`,
                    "YYYY-MM-DD HH:mm"
                  );
                  const isPastTime = showtimeMoment.isBefore(moment()); // ตรวจสอบว่ารอบนั้นเลยเวลาปัจจุบันไปแล้วหรือไม่

                  return (
                    <Button
                      key={time}
                      type={time === selectedTime ? "primary" : "default"}
                      onClick={() => setSelectedTime(time)}
                      disabled={isPastTime} // ปิดการใช้งานปุ่มถ้าเวลารอบนั้นผ่านไปแล้ว
                      style={{
                        marginLeft: "10px",
                        backgroundColor: time === selectedTime ? "#05234d" : "",
                    
                      }} // ระยะห่างทางซ้าย
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#05234d")
                      } // เมื่อ hover เป็นสีเหลือง
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          time === selectedTime ? "#05234d" : "")
                      } // คืนค่ากลับเมื่อ hover ออก
                    >
                      {time}
                    </Button>
                  );
                })
              ) : (
                <p>No showtimes available</p>
              )}
            </div>
          </Card>

          {/* Location */}
          <Card style={{ marginBottom: "10px" }}>
            <Card.Meta title="Location" />
            <div className="flex items-center mt-4">
              <EnvironmentOutlined className="w-4 h-4 mr-2" />
              <span>The Mall Korat</span>
            </div>
          </Card>

          {/* Synopsis */}
          <Card style={{ marginBottom: "10px" }}>
            <Card.Meta title="Synopsis" />
            <div className="flex items-center mt-4">
              <FileTextOutlined className="w-4 h-4 mr-2" />
              <div style={{ padding: "10px" }}>
                <p>{synopsis}</p>
              </div>
            </div>
          </Card>

          {/* Select Seat Button */}
          <Button
            type="primary"
            className="w-full mb-4"
            style={{
              height: "40px",
              backgroundColor: "#FFD700",
              border: "2px solid #FFD700",
              color: "black",
            }}
            onClick={handleSelectSeat}
            disabled={!selectedTime} // Disable button if no time is selected
          >
            Select seat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieBooking;
