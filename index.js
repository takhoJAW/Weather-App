import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv"



dotenv.config();

const app = express();
const API_URL = "https://api.openweathermap.org/data/2.5";
const port = 3000;
const APIKey = process.env.API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/current_weather", async (req, res) => {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
         return res.status(400).send("Please enter both latitude and longitude.");
    }
    try {
        const weather = await axios.get(`${API_URL}/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`);
        res.render("current.ejs", { CWeather: weather.data });
    } catch (error) {
        res.status(500).send("Error fetching weather data");
    }
});

app.post("/forecast", async (req, res) => {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
        // return res.status(400).send("Please enter both latitude and longitude.");
    }
    try {
        const forecast = await axios.get(`${API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`);

        // Group data by day
        const dailyData = {};
        forecast.data.list.forEach(entry =>{
            const date = entry.dt_txt.split(" ")[0];
            if(!dailyData[date]){
                dailyData[date] = [];
           }
                dailyData[date].push(entry);
        });

        // Process each day's data
        const processedData = Object.keys(dailyData).map( rooz =>{
            const dayData = dailyData[rooz];
            const dayEntries = dayData.filter(block => new Date(block.dt_txt).getHours()===12);
            const nightEntries = dayData.filter(block => new Date(block.dt_txt).getHours()===0);
        

            const dayWeather = dayEntries.length ? dayEntries[0] : dayData[0];
            const nightWeather = nightEntries.length ? nightEntries[0] : dayData[dayData.length - 1];


            return {
                rooz,
                dayIcon: dayWeather ? dayWeather.weather[0].icon : null,
                dayTemp : dayWeather ? dayWeather.main.temp : null,
                dayDesc: dayWeather ? dayWeather.weather[0].main :null,
                nightIcon: nightWeather ? nightWeather.weather[0].icon : null,
                nightTemp: nightWeather ? nightWeather.main.temp : null,
                nightDesc: nightWeather? nightWeather.weather[0].main : null,
                entries: dayData
            }
        });

        res.render("forecast.ejs", { forecast: processedData });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        res.status(500).send("Error fetching forecast data");
    }   
});

app.listen(port, () => {
    console.log(`server is running on port ${port}.`);
});