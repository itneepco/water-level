import fs from 'fs';
import path from 'path';

export function getLatestFile(dir, location) {
    const files = fs.readdirSync(dir).filter((file) =>
       file.endsWith(".mis") && file.startsWith(location));
    if (files.length === 0) return null;
  
    // Sort by file creation time (or use timestamps in filenames if consistent)
    const sortedFiles = files.sort((a, b) => {
      const aTime = fs.statSync(path.join(dir, a)).mtime;
      const bTime = fs.statSync(path.join(dir, b)).mtime;
      return bTime - aTime; // Latest first
    });
    return path.join(dir, sortedFiles[0]);
  }
  
  // Function to parse the raw data file
  export function parseFileContent(content, location) {
    const lines = content.split("\n");  
    let dateTime = "";
    let waterLevel = "";
    let discharge = "";
    let battery = "";
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
  
    //   if (line.startsWith("<STATION>")) {
    //     const stationMatch = line.match(/<STATION>(.*?)<\/STATION>/);
    //     if (stationMatch) {
    //       station = stationMatch[1];
    //     }
    //   }
  
      if (line.includes("<SENSOR>LEVE</SENSOR>")) {
        const waterLevelMatch = lines[i + 1]?.match(
          /(\d{4}\/\d{2}\/\d{2};\d{6});([\d.]+)/
        );
        if (waterLevelMatch) {
          dateTime = convertDateFormat(waterLevelMatch[1]);
          waterLevel = waterLevelMatch[2];
        }
      }
  
      if (line.includes("<SENSOR>DISC</SENSOR>")) {
        const dischargeMatch = lines[i + 1]?.match(
          /(\d{4}\/\d{2}\/\d{2};\d{6});([\d.]+)/
        );
        if (dischargeMatch) {
          discharge = dischargeMatch[2];
        }
      }
  
      if (line.includes("<SENSOR>BATT</SENSOR>")) {
        const dischargeMatch = lines[i + 1]?.match(
          /(\d{4}\/\d{2}\/\d{2};\d{6});([\d.]+)/
        );
        if (dischargeMatch) {
          battery = dischargeMatch[2];
        }
      }
    }
  
    return {
      projectName: 'Kameng Hydro Electric Power Plant',
      locationName: location,  
      batteryHealth: battery >= 12.5 ? 'healthy' : 'unhealthy',
      waterLevel: waterLevel,    
      discharge: discharge,
      batteryVolt: battery,
      dateTime: dateTime
    };
  }

  function convertDateFormat(dateTime) {
    const [date, time] = dateTime.split(';');
    const formattedDate = date.replace(/\//g, '-');
    const hours = time.slice(0, 2);
    const minutes = time.slice(2, 4);
    const seconds = time.slice(4, 6);
    return `${formattedDate} ${hours}:${minutes}:${seconds}`;
  }