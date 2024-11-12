import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';

const app = express();
const PORT = 5000;
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use('/songs', express.static(path.join(__dirname, 'songs')));

const getSongMetadata = async (filePath) => {
    try {
        const metadata = await parseFile(filePath);
        return {
            duration: metadata.format.duration
        };
    } catch (error) {
        console.error('Error reading metadata:', error);
        return {
            duration: 'Unknown'
        };
    }
};

app.get('/api/songs', async (req, res) => {
    try {
        const songsDirPath = path.join(__dirname, 'songs');
        const songFiles = await fs.promises.readdir(songsDirPath);
        
        const songs = await Promise.all(songFiles.map(async (file, index) => {
            const filePath = path.join(songsDirPath, file);
            
           
            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) {
                return null;
            }
            
            const metadata = await getSongMetadata(filePath);
            const duration = metadata.duration ? new Date(metadata.duration * 1000).toISOString().substr(11, 8) : 'Unknown'; 
            return {
                id: index + 1,
                title: path.parse(file).name, 
                src: `https://fog-assessment-cuvette-ap.onrender.com/songs/${file}`,
                duration: duration,
                plays: "643.786.045",
                album: 'Thriller 25 Sup...', 
                img: 'default-image-url.jpg' 
            };
        }));

        
        res.json(songs.filter(song => song !== null));
    } catch (error) {
        console.error('Error reading songs:', error);
        res.status(500).json({ error: 'Unable to read songs directory' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
