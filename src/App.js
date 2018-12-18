import React, { Component } from 'react';
import {csv} from 'd3-request';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import {LineChart, d3} from 'react-d3-components';
import Select from 'react-select';
import ReactAutocomplete from 'react-autocomplete';

var teams={};
var teamNames = [];
const options = [
  { value: 'Summary', label: 'Summary' },
  { value: 'Visitor', label: 'Visitor' },
  { value: 'Home', label: 'Home' }
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonClicked: [],
      data:[{
        label: '',
        values:[{
          x:'',
          y:''
        }]
      }],
      label:''

    };

    this.onChangeTeam = this.onChangeTeam.bind(this);
  }

  componentWillMount() {
    csv('./nba.csv', (error, data) => {
      if (error) {
        this.setState({loadError: true});
      }

      for( var i=0;i<data.length;i++){
           var temp_date = data[i].Date;
           var ptsv = data[i]['PTS/V'];
           var ptsh = data[i]['PTS/H'];
           var name_v = data[i]['Visitor/Neutral'];
           var name_h = data[i]['Home/Neutral'];
           var temp_v = {
                  Date : temp_date,
                  Team : name_v,
                  Side : 'Visitor',
                  PTS : ptsv
              }
          var temp_h = {
                 Date : temp_date,
                 Team : name_h,
                 Side : 'Home',
                 PTS : ptsh
             }

           if(!teams.hasOwnProperty(name_v)){    
              teams[name_v]=[];
              teamNames.push(name_v);
            }

           if(!teams.hasOwnProperty(name_h)){
              teams[name_h]=[];
              teamNames.push(name_h);
            }
            teams[name_v].push(temp_v);
            teams[name_h].push(temp_h);
      }

  })
  }

  handleChange(selectedOption){
    // console.log(this);
    if(this.state.label !== ''){
      if(selectedOption.value === 'Summary'){
        var dataset = [];
        for(var i=0;i<teams[this.state.label].length;i++){
          var date_temp = teams[this.state.label][i].Date;
          var month = parseInt(date_temp[0]+date_temp[1])-1;
          var day = parseInt(date_temp[3]+date_temp[4])-1;
          var temp = {
            x: new Date(2016,month,day), 
            y: teams[this.state.label][i].PTS
          }
          dataset.push(temp);
        }              
      }else{
        var dataset = [];
        for(var i=0;i<teams[this.state.label].length;i++){
          if(selectedOption.value === teams[this.state.label][i].Side){
            var date_temp = teams[this.state.label][i].Date;
            var month = parseInt(date_temp[0]+date_temp[1])-1;
            var day = parseInt(date_temp[3]+date_temp[4])-1;
            var temp = {
              x: new Date(2016,month,day), 
              y: teams[this.state.label][i].PTS
            }
            dataset.push(temp);
          }
          // console.log(dataset);
      }
    }

     this.setState({
         data:[{
              label : this.state.label, 
              values: dataset
         }],
         xScale: d3.time.scale().domain([new Date(2016, 9, 25), new Date(2016, 11, 31)]).range([0,800]),
         yScale: d3.svg.axis().scale().domain([150,40]).range([0,800])
       })        
      }
  }

  onSearch(){
    var dataset = [];
    for(var i=0;i<teams[this.state.value].length;i++){
      var date_temp = teams[this.state.value][i].Date;
      var month = parseInt(date_temp[0]+date_temp[1])-1;
      var day = parseInt(date_temp[3]+date_temp[4])-1;
      var temp = {
        x: new Date(2016,month,day), 
        y: teams[this.state.value][i].PTS
      }
      dataset.push(temp);
    }

    this.setState({
       data:[{
            label: this.state.value,
            values: dataset
       }],
       label: this.state.value,
       xScale: d3.time.scale().domain([new Date(2016, 9, 25), new Date(2016, 11, 31)]).range([0,800]),
       yScale: d3.svg.axis().scale().domain([150,40]).range([0,800])
     })
    }

  onChangeTeam(teamName){
    var dataset = [];
    var prevList = this.state.buttonClicked;
    for(var i=0;i<teams[teamName].length;i++){
      var date_temp = teams[teamName][i].Date;
      var month = parseInt(date_temp[0]+date_temp[1])-1;
      var day = parseInt(date_temp[3]+date_temp[4])-1;
      var temp = {
        x: new Date(2016,month,day), 
        y: teams[teamName][i].PTS
      }
      dataset.push(temp);
    }
    // console.log(this.state.buttonClicked);
    // if(prevList.include(teamName)){ 

      var list = this.state.data;
      var newLabel = this.state.label;
      for(var j = 0;j<list.length;j++){
          if(list[j].label == teamName){
             list.splice(j,1);
             newLabel =newLabel.substr((newLabel.length-teamName.length+1),(teamName.length+1)); 
             return(
             this.setState({
               // buttonClicked:newList,
               data: list,
               label: newLabel,
               xScale: d3.time.scale().domain([new Date(2016, 9, 25), new Date(2016, 11, 31)]).range([0,800]),
               yScale: d3.svg.axis().scale().domain([150,40]).range([0,800])
             }));              
          }
      }

      // var newList = prevList.splice(prevList.indexOf(teamName),1);   
    
    // }else{    
      // var newList = this.state.buttonClicked.push(teamName);
      list.push({
        label:teamName,
        values:dataset
      });

      if(newLabel === ""){
         newLabel = teamName;
      }else{
        newLabel = newLabel+'/'+teamName;
      }
      // console.log(list);
      this.setState({
          // buttonClicked:newList,
          data: list,
          label: newLabel,
          xScale: d3.time.scale().domain([new Date(2016, 9, 25), new Date(2016, 11, 31)]).range([0,800]),
          yScale: d3.svg.axis().scale().domain([150,40]).range([0,800])
        })
    // console.log(this.state.buttonClicked);
    // }
  }

  render() {
    const { selectedOption } = this.state;
    var button_style = {
        marginLeft:'1em',
        marginTop:'1em',
    }

    var p_style = {
        fontSize:60, 
        color:'Black',
        font:'bold'
    }

    return (

      <div className="App">
        <h1 >Welcome to 2018 NBA Teams Score Statistics</h1>
        <div style={{zIndex:'1'}}>
        <ReactAutocomplete
            items={[
              { id: teamNames[0], label: teamNames[0]},
              { id: teamNames[1], label: teamNames[1]},
              { id: teamNames[2], label: teamNames[2]},
              { id: teamNames[3], label: teamNames[3]},
              { id: teamNames[4], label: teamNames[4]},
              { id: teamNames[5], label: teamNames[5]},
              { id: teamNames[6], label: teamNames[6]},
              { id: teamNames[7], label: teamNames[7]},
              { id: teamNames[8], label: teamNames[8]},
              { id: teamNames[9], label: teamNames[9]},
              { id: teamNames[10], label: teamNames[10]},
              { id: teamNames[11], label: teamNames[11]},
              { id: teamNames[12], label: teamNames[12]},
              { id: teamNames[12], label: teamNames[13]},
              { id: teamNames[14], label: teamNames[14]},
              { id: teamNames[15], label: teamNames[15]},
              { id: teamNames[16], label: teamNames[16]},
              { id: teamNames[17], label: teamNames[17]},
              { id: teamNames[18], label: teamNames[18]},
              { id: teamNames[19], label: teamNames[19]},
              { id: teamNames[20], label: teamNames[20]},
              { id: teamNames[21], label: teamNames[21]},
              { id: teamNames[22], label: teamNames[22]},
              { id: teamNames[23], label: teamNames[23]},
              { id: teamNames[24], label: teamNames[24]},
              { id: teamNames[25], label: teamNames[25]},
              { id: teamNames[26], label: teamNames[26]},
              { id: teamNames[27], label: teamNames[27]},
              { id: teamNames[28], label: teamNames[28]},
              { id: teamNames[29], label: teamNames[29]}                                                                                                           
            ]}
            shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
            getItemValue={item => item.label}
            renderItem={(item, highlighted) =>
              <div
                key={item.id}
                style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
              >
                {item.label}
              </div>
            }
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
            onSelect={value => this.setState({ value })}
        />
        <button type='button' onClick={this.onSearch.bind(this)} className='btn btn-second' style={{clear:'both'}}>Search</button>
        </div>
        <br/>
        <div style={{ marginLeft:'20%', marginRight:'20%'}}>
        <button type='button' onClick={this.onChangeTeam.bind(this,'Atlanta Hawks')} className='btn btn-primary' style={button_style}>Atlanta Hawks</button>
        <button type='button' onClick={this.onChangeTeam.bind(this,'Boston Celtics')} className='btn btn-primary' style={button_style}>Boston Celtics</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Brooklyn Nets')} className='btn btn-primary' style={button_style}>Brooklyn Nets</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Charlotte Hornets')} className='btn btn-primary' style={button_style}>Charlotte Hornets</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Chicago Bulls')} className='btn btn-primary' style={button_style}>Chicago Bulls</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Cleveland Cavaliers')} className='btn btn-primary' style={button_style}>Cleveland Cavaliers</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Dallas Mavericks')} className='btn btn-primary' style={button_style}>Dallas Mavericks</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Denver Nuggets')} className='btn btn-primary' style={button_style}>Denver Nuggets</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Detroit Pistons')} className='btn btn-primary' style={button_style}>Detroit Pistons</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Golden State Warriors')} className='btn btn-primary' style={button_style}>Golden State Warriors</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Houston Rockets')} className='btn btn-primary' style={button_style}>Houston Rockets</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Indiana Pacers')} className='btn btn-primary' style={button_style}>Indiana Pacers</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Los Angeles Clippers')} className='btn btn-primary' style={button_style}>Los Angeles Clippers</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Los Angeles Lakers')} className='btn btn-primary' style={button_style}>Los Angeles Lakers</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Memphis Grizzlies')} className='btn btn-primary' style={button_style}>Memphis Grizzlies</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Miami Heat')} className='btn btn-primary' style={button_style}>Miami Heat</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Milwaukee Bucks')} className='btn btn-primary' style={button_style}>Milwaukee Bucks</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Minnesota Timberwolves')} className='btn btn-primary' style={button_style}>Minnesota Timberwolves</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'New Orleans Pelicans')} className='btn btn-primary'style={button_style}>New Orleans Pelicans</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'New York Knicks')} className='btn btn-primary' style={button_style}>New York Knicks</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Oklahoma City Thunder')} className='btn btn-primary' style={button_style}>Oklahoma City Thunder</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Orlando Magic')} className='btn btn-primary' style={button_style}>Orlando Magic</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Philadelphia 76ers')} className='btn btn-primary' style={button_style}>Philadelphia 76ers</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Portland Trail Blazers')} className='btn btn-primary' style={button_style}>Portland Trail Blazers</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Sacramento Kings')} className='btn btn-primary' style={button_style}>Sacramento Kings</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'San Antonio Spurs')} className='btn btn-primary' style={button_style}>San Antonio Spurs</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Toronto Raptors')} className='btn btn-primary' style={button_style}>Toronto Raptors</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Utah Jazz')} className='btn btn-primary' style={button_style}>Utah Jazz</button>
        <button type='button' onClick={this.onChangeTeam.bind(this, 'Washington Wizards')} className='btn btn-primary' style={button_style}>Washington Wizards</button>
        </div>
        <br/><br/>
        <div>
        <br/>
        <p style={p_style}>{this.state.label}</p>
        <div style={{width:'200px',margin:'auto',textAlign:'center',zIndex:'-1'}}>        
        <Select
        value={selectedOption}
        onChange={this.handleChange.bind(this)}
        options={options}
        />
        </div>
        <LineChart
            data={this.state.data}
            width={800}
            height={800}
            margin={{top: 10, bottom: 50, left: 50, right: 20}}
            xScale={this.state.xScale}
            yScale={this.state.yScale}
        />
        </div>       


      </div>
    );
  }
}

export default App;


