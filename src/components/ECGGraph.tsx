import {  useRef, useEffect, ChangeEvent, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // ADD THIS
import {Chart as chartJS} from 'chart.js/auto'; // ADD THIS
export const ECGGraph = (): JSX.Element => {

  const ref = useRef<chartJS<"line">>();
  const [imageLoaded, setImageLoaded] = useState(false);
  const image = useRef<HTMLImageElement | null>(null);
  const [dataPointsPerSecond, setDataPointsPerSecond] = useState<number>(100); // Default value is 100 data points per second
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(dataPointsPerSecond * 6);
  const [data, setData] = useState<{ time: string; ecg: number }[]>([]);


  const handleDataPointsInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setDataPointsPerSecond(value);
      setEndIndex(startIndex + (value * 6));
    }
  };


  const handleNextClick = () => {
    if (endIndex < data.length) {
      setStartIndex(endIndex);
      setEndIndex(endIndex + dataPointsPerSecond * 6);
    }
  };

  const handlePreviousClick = () => {
    if (startIndex - dataPointsPerSecond * 6 >= 0) {
      setEndIndex(startIndex);
      setStartIndex(startIndex - dataPointsPerSecond * 6);
    }
  };

  const handleFile = (e : ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.readAsText(e.target.files[0], 'UTF-8');
      reader.onloadend = (readerEvent: ProgressEvent<FileReader>) => {
        if (readerEvent?.target?.result) {
          let lines = readerEvent.target.result.toString().split('\n')
          let tempdata : { time: string; ecg: number }[] = []
          for(let idx =0 ; idx < lines.length;idx++){
            if(lines[idx].includes('->')){
              let temp = lines[idx].split('->')
              let row : { time: string; ecg: number } = {
                time : temp[0],
                ecg : parseInt(temp[1])
              }
              tempdata.push(row)
            }
            else{
              let temp = lines[idx].split(',')
              let row : { time: string; ecg: number } = {
                time : temp[1],
                ecg : parseInt(temp[2])
              }
              tempdata.push(row)
            }
           
           image.current = new Image();
           image.current.src = require("../assets/ecg.png"); // Adjust the path as needed
           image.current.onload = () => {
             setImageLoaded(true);
           };
           if(ref.current){
            ref.current.update()
           }
          }
          setData(tempdata)
        }
      };
    }
  }

  const imageBackground = {
    id : 'imageBackground',
    beforeDraw : function(chart : any){
        chart.ctx.save()
        chart.ctx.fillStyle = "rgba(1,1,1,0)";
        chart.ctx.fillRect(chart.chartArea.left, chart.chartArea.top, chart.chartArea.width ,  chart.chartArea.height)
        if(image.current){
          chart.ctx.drawImage(image.current ,  chart.chartArea.left, chart.chartArea.top, chart.chartArea.width ,  chart.chartArea.height)
           
        }
        chart.ctx.restore()
    }

  }

  

  return (
    <div style={{display : "flex"  , justifyContent : "center" , alignItems : "center" , flexDirection : "column"}}>
      <div style={{display : "flex"  , justifyContent : "space-around" , alignItems : "center" , flexDirection : "row"}}>
        <div>
          <label>Data Points Per Second:</label>
          <input type="number" value={dataPointsPerSecond} onChange={handleDataPointsInputChange} />
        </div>
        <div><input type='file' name='ecg-data' onChange={handleFile}/></div>
        <div >
        <button onClick={handlePreviousClick} disabled={startIndex === 0}>Previous</button>
        <button onClick={handleNextClick} disabled={endIndex >= data.length}>Next</button>
      </div>
      </div>
      {imageLoaded && data.length > 0 &&  (
         <div style={{ padding : "2%" ,maxWidth: '1200px', maxHeight: '500px', width: '100%', height: '100%' }}>
         <Line   ref={ref}
                 plugins={[imageBackground]} 
                 data={{
                   labels: data.slice(startIndex, endIndex).map(item => item.time), // Your X-axis labels
                   datasets: [{
                     label: 'ECG Data',
                     data: data.slice(startIndex, endIndex).map(item => item.ecg), // Your Y-axis data
                     borderColor: '#000000',
                     backgroundColor : 'rgba(1,1,1,0)',
                     borderWidth: 1.25,
                     pointRadius :0,
                     fill: false,
                     order : 1
                   }]
                 }} 
                 options={{
 
                     maintainAspectRatio : false,
                     scales: {
                       y: {
                         grid: {
                           display : false
                         }
                       },
                       x: {
                         grid: {
                           display : false
                         },
                         ticks : {
                          maxTicksLimit  :6
                         }
                       }
                     }
                     
     
                 }} 
                 
                 height={500}
                 width={400}
         />
     </div>
      )}
     
    </div>
  )
};

export default ECGGraph