import React from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


export const LineGraph = (props) => {    
    return (
      <div>
        <Line
          data={{
              labels: props.labels,
              datasets:[
                  {
                    label:"Deaths",
                    data:props.deaths,
                    borderColor: "red"
                  },
                  {
                      label:"Cases",
                      data:props.cases,
                      borderColor:"blue"
                  }
              ]
          }}

          height={150}
          options={{
            responsive: false,
            maintainAspectRatio: true,
            plugins: {
              title: {
                display: true,
                text: "COVID-19 Analysis"
              },
              legend: {
                display: true,
                position: "bottom"
             }
            },
            
          }}
        
        />
      </div>
    );
  };