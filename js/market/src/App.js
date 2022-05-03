import './App.css';
import React from 'react';
import { Grommet, Card, Grid, Box, Tabs, Tab, Stack, CardHeader, CardBody,
         Image, Text, Form, FormField, TextInput, CheckBox, List, Button, Spinner, Layer } from 'grommet';
import { grommet, dark} from "grommet";
import { Console, Volume, Network, DocumentSound,
         Domain, Play, Browse, Sort, VolumeControl,
         Announce, Lastfm, Local, Server, FormPrevious,
         AddCircle, FormClose, Save, Rss, Sync, Technology, 
         Device, Raspberry, Install, Trash, Configure } from 'grommet-icons';
import { deepMerge } from 'grommet/utils';
import { css } from 'styled-components';

var basicURL = "/market/"
//var basicURL = "http://homes.lan:6680/market/" //for testing

class App extends React.Component {

 constructor(props) {
    super(props);
    this.state = {
      error: null,
      uninstallDialog: false,
      installedLoaded: true,
      availableLoaded: true,
      uninstalled: [],
      configLoaded: true,
      configSchemaLoaded: true,
      extInfoLoaded: true,
      pending: [],
      canRemove: false,
      needRestart: false,
      installed_list: [],
      installed: [],
      available: [],
      currentExt: {"name":""},
      configSchema: {},
      config: {},
      nconfig: {}
    };
  }

  componentDidMount() {
    this.setState({installedLoaded: false, availableLoaded: false})
    fetch(basicURL+"marketapi/installed")
      .then(res => res.json())
      .then(
        (result) => {
        console.log(result)
          var ext_list = [];
          for(var c in result) {
             ext_list.push(result[c].name)
          }
          this.setState({
            installedLoaded: true,
            installed: result,
            installed_list: ext_list
          });
        },
        (error) => {
          console.log('fetch error')
          console.log(error)
          this.setState({
            installedLoaded: true,
            error
          });
        }
      )
    fetch(basicURL+"marketapi/available")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            availableLoaded: true,
            available: result
          });
        },
        (error) => {
          console.log('fetch error')
          console.log(error)
          this.setState({
            availableLoaded: true,
            error
          });
        }
      )
    fetch(basicURL+"marketapi/pending")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            pending: result,
            uninstalled: result.filter( change => change.changes == 'uninstalled' ).map( change => change.name ),
            needRestart: result.length != 0
          });
        },
        (error) => {
          console.log('fetch error')
          console.log(error)
          this.setState({
            availableLoaded: true,
            error
          });
        }
      )
  }



installClick = () => {
   fetch(basicURL+"marketapi/install/"+this.state.currentExt.name)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.result == 'installed') {
            this.setState({ pending: this.state.pending.concat({'name': result.name, 'changes':'installed'}), needRestart: true
            });
          }
        },
        (error) => {
          console.log('fetch error')
          console.log(error)
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
}

uninstallClick = () => {
   fetch(basicURL+"marketapi/uninstall/"+this.state.currentExt.name)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.result == 'uninstalled') {
            this.setState({ pending: this.state.pending.concat({'name': result.name, 'changes':'uninstalled'}), 
                      uninstalled: this.state.uninstalled.concat(result.name), needRestart: true
            });
          }
        },
        (error) => {
          console.log('fetch error')
          console.log(error)
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
}


saveClick = () => {
  console.log(this.state.config)
  const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state.config)
    };
   fetch(basicURL+"marketapi/save/"+this.state.currentExt.name, requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          if (result.result == 'changed') {
            this.setState({ pending: this.state.pending.concat({'name':result.name, 'changes':'configuration changed'}), needRestart: true
            });
          }
        },
        (error) => {
          console.log('fetch error')
          console.log(error)
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
}

cardClick = (item) => {
   console.log(item)
   window.location.hash = item.name
   this.setState({currentExt:item, extinfo:'', config:{}, configSchema:{}, configLoaded: false, configSchemaLoaded: false, extInfoLoaded: false, canRemove:false})
   fetch(basicURL+"marketapi/configschema/"+item.name)
      .then(res => res.json())
      .then(
        (result) => {
          var nconfig = {}
          for (var c in result) 
            nconfig[c] = ""
          this.setState({
            configSchemaLoaded: true, configSchema: result, nconfig: nconfig
          });
        },
        (error) => {
          console.log('fetch error')
          console.log(error)
          this.setState({
            configSchemaLoaded: true,
            error
          });
        }
      )
   fetch(basicURL+"marketapi/config/"+item.name)
      .then(res => res.json())
      .then(
        (result) => {
          var nconfig = this.state.nconfig
          for (var c in result) 
            nconfig[c] = result[c]

          this.setState({
            configLoaded: true, config: result, nconfig: nconfig
          });
        },
        (error) => {
          console.log('fetch error')
          console.log(error)

          this.setState({
            configLoaded: true,
            error
          });
        }
      )
   fetch(basicURL+"marketapi/extinfo/"+item.name)
      .then(res => res.text())
      .then(
        (result) => {
          this.setState({
            extInfoLoaded: true, extinfo: result
          });
        },
        (error) => {
          console.log('fetch error')
          console.log(error)

          this.setState({
            extInfoLoaded: true,
            error
          });
        }
      )
   fetch(basicURL+"marketapi/canremove/"+item.name)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result)
          this.setState({
            canRemove: result.result
          });
        },
        (error) => {
          console.log('fetch error')
          console.log(error)

          this.setState({
            error
          });
        }
      )


}

tabSelected = () => {
  this.setState({currentExt:{"name":""}})
}

renderImage = (item) => {
return    <Box>{!(["audio","logging","proxy","file", "core", "http","m3u", "softwaremixer", 
                   "stream", "scrobbler", "local", "master", "podcast", "autoplay", "headless", "pidi", "raspberry-gpio"].includes(item.name)) && <Image
                    src={item.image}
                    fill="horizontal"
                    fit="contain"
                    color="white"
                    width={90}
                    height={45}
                  />}
                 {item.name == "core" && <Play color="neutral-3" size="large" />}
                 {item.name == "logging" && <Console color="icon1" size="large" />}
                 {item.name == "audio" && <Volume color="orange" size="large" />}
                 {item.name == "proxy" && <Network color="icon1" size="large" />}
                 {item.name == "file" && <DocumentSound color="neutral-3" size="large" />}
                 {item.name == "http" && <Domain color="icon1" size="large" />}
                 {item.name == "m3u" && <Sort color="neutral-2" size="large" />}
                 {item.name == "softwaremixer" && <VolumeControl color="icon1" size="large" />}
                 {item.name == "stream" && <Announce color="icon1" size="large" />}
                 {item.name == "scrobbler" && <Lastfm color="red" size="large" />}
                 {item.name == "local" && <Local color="accent-2" size="large" />}
                 {item.name == "master" && <Server color="red" size="large" />}
                 {item.name == "podcast" && <Rss color="neutral-3" size="large" />}
                 {item.name == "autoplay" && <Sync color="neutral-2" size="large" />}
                 {item.name == "headless" && <Technology color="icon1" size="large" />}
                 {item.name == "pidi" && <Device color="red" size="large" />}
                 {item.name == "raspberry-gpio" && <Raspberry color="red" size="large" />}
           </Box>
}

renderInstalledGrid = () => {
   console.log(this.state.uninstalled)
   return   <Grid
         gap="small"
         columns={{ count: 'fit', size: ['small'] }}
         rows={{ count: 'fit', size: ['small'] }}
      >

    {this.state.installed.map((item, i) => {
     if (this.state.uninstalled.includes(item.name)) {
       return <Box></Box>
     }
     return  <Card key={item.name} onClick={() => {this.cardClick(item)}} elevation="xxsmall" colors={{border:"#424242"}} border={true} background="#141414" ><Stack>
                 <CardBody height="small" width="small" justify="center" align="center" background="#121212" >
                    {this.renderImage(item)}
                </CardBody>
               <CardHeader
                  pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                  background={item.enabled && "brand" || "#424242"}
                  width="medium"
                  justify="start"
                >
                <Text size="medium" color="#000000" justify="center" >{item.name}</Text>
                </CardHeader>
             </Stack>

             </Card>
     })}

     </Grid>


}


renderAvailableGrid = () => {
   return   <Grid
         gap="small"
         columns={{ count: 'fit', size: ['small'] }}
         rows={{ count: 'fit', size: ['small'] }}
      >
    {this.state.available.map((item, i) => {
     return  <Card key={item.name} onClick={() => {this.cardClick(item)}} elevation="xxsmall" colors={{border:"#424242"}} border={true} background="#141414" ><Stack>
                 <CardBody height="small" width="small" justify="center" align="center" background="#121212" >
                    {this.renderImage(item)}
                </CardBody>
               <CardHeader
                  pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                  background="dark-4"
                  width="medium"
                  justify="start"
                >
                <Text size="medium" color="#121212" >{item.name}</Text>
                </CardHeader>
             </Stack>

             </Card>
     })}

     </Grid>


}

addToList = (itemName) => {
  var newConfig = this.state.config;
  if (!newConfig[itemName])
     newConfig[itemName] = []
  newConfig[itemName].push(this.state.nconfig[itemName])
  this.setState({ config: newConfig})
}

delFromList = (itemName, index) => {
  var newConfig = this.state.config;
  newConfig[itemName].splice(index,1)
  this.setState({ config: newConfig})
}

renderControl = (item) => {
  var t = this.state.configSchema[item];
  var v = this.state.config[item];
  if (['AutoValue'].includes(t) )
    return <Box></Box>
  return <FormField label={item} htmlFor={item} > 
           {['String','Integer','Path','Hostname','Port'].includes(t) && <TextInput id={item} value={v} margin="large" onChange={(event) => {
              var nconfig = this.state.config;
              nconfig[item] = event.target.value
              this.setState({config:nconfig})
            }} />} 
           {['Secret'].includes(t) && <TextInput id={item} type="password" value={v} onChange={(event) => {
              var nconfig = this.state.config;
              nconfig[item] = event.target.value
              this.setState({config:nconfig})
            }}/>} 
           {['Boolean'].includes(t) && <CheckBox id={item} checked={this.state.config[item]} onChange={(event) => {
              var nconfig = this.state.config;
              nconfig[item] = event.target.checked
              this.setState({config:nconfig})
            }}/>} 
           {['List'].includes(t) && <Box><List id={item} data={v}   action={(listitem, index) => (
           <Button
            key={index}
            icon={<FormClose />}
            onClick={() => { this.delFromList(item,index) }}
            hoverIndicator
           />
           )}
           />
            <Box direction="row">
            <Button plain={true} justify="left" margin="small" size="small" 
                icon={<AddCircle color="yellow" />}label="Add" 
                onClick={() => {this.addToList(item)}} />
            <TextInput placeholder="new item" value={this.state.nconfig[item]} onChange={(event) => {
              var nconfig = this.state.nconfig;
              nconfig[item] = event.target.value
              this.setState(nconfig)
            }} /></Box></Box>}
         </FormField>
}

renderExt = () => {
  const keys = Object.keys(this.state.configSchema);
  console.log(this.state.canRemove)
  return  <Box><Button icon={<FormPrevious/>} label="Back" color="brand" onClick={this.tabSelected} width="100px" ></Button>
          <Box direction="row" pad="small" align="center" >{this.renderImage(this.state.currentExt)}
          <Text margin="large" justify="center" >{this.state.currentExt.name}</Text></Box>
          <Box><Form direction="column"> 
          {keys.map( (item, i) => { 
            return this.renderControl(item)
          })}</Form></Box>
          <Box size="small" pad="medium" direction="row" justify="between" >
          {this.state.installed_list.includes(this.state.currentExt.name) && <Button icon={<Save/>} color="sdark" label="Save"  pad="medium" justify="center"  onClick={this.saveClick} width="small" ></Button>}
          {(!this.state.installed_list.includes(this.state.currentExt.name)) && <Button icon={<Install/>} color="sdark" label="Install"  pad="medium" justify="center"  onClick={this.installClick} width="medium" ></Button>}
          {this.state.canRemove && <Button icon={<Trash/>} color="sdark" label="Uninstall" pad="medium"  onClick={this.showUninstallDialog} width="small" ></Button>}
          </Box>
          <Box> <div dangerouslySetInnerHTML={{ __html: this.state.extinfo }} /> </Box>
          </Box>
}

renderChanges = () => {
  return <Box className="changes" ><Text className="changes" >Mopidy must be restarted to apply changes:</Text>
          {this.state.pending.map( (item, i) => { 
            return <Text className="changes" >- {item.name} ({item.changes})</Text>
          })}
     </Box>
}

showUninstallDialog = () => {
  this.setState({uninstallDialog:true})
}

hideDialog = () => {
  this.setState({uninstallDialog:false})
}

render = () => {

const customTheme = deepMerge(dark, {
  global: {
    colors: {
      brand: "#4f9a94",
      "neutral-1": "#10873D",
      "neutral-2": "#20873D",
      "bdark": "#80cbc4",
      "blight": "#b2fef7",
      "sdark": "#672731",
      "slight": "#672731",
      "sec": "#98525a",
      "border": "#424242",
      "icon1": "#747474",
      "dark-2": "#ff7043",
      "dark-2": "#c63f17",
      "dark-5": "#81c784",
      "dark-4": "#519657",
      "dark-2": "#ffb74d",
      "dark-6": "#ffa726"
    },
    edgeSize: {
      small: '10px',
    },
    elevation: {
      light: {
        small: '0px 1px 5px rgba(0, 0, 0, 0.50)',
        medium: '0px 3px 8px rgba(0, 0, 0, 0.50)',
      },
    },
  },
  button: {
    border: {
      color: 'accent-2',
    },
    color: { dark: 'accent-1', light: 'dark-2' },
    primary: {
      color: 'neutral-2',
    },
    padding: {
      vertical: '12px',
      horizontal: '24px',
    },
    extend: (props) => {
      return `
        color: white;
        font-size: 11pt;
        width: 130px;
      `;
    },
  },
  list: {
    item: {
      pad: { horizontal: 'large', vertical: 'xsmall' },
      background: ['neutral-2'],
      border: true,
    },
  },
  tab: {
    active: {
      background: 'dark-2',
      color: '#121212',
    },
    background: 'brand',
    border: undefined,
    color: '#121212',
    hover: {
      background: 'dark-6',
      color: '#121212',
      stroke: 'dark-1'
    },
    margin: undefined,
    pad: {
      bottom: undefined,
      horizontal: 'small',
    },
    extend: ({ theme }) => css`
      border-radius: 4px;
      /* or 'border-radius: ${theme.global.control.border.radius}' */
      box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.5);
      /* or 'box-shadow: ${theme.global.elevation.light.small}' */
    `,
  },
  tabs: {
    background: 'dark',
    gap: 'medium',
    header: {
      background: 'brand',
      extend: ({ theme }) => css`
        padding: 10px;
        /* or 'padding: ${theme.global.edgeSize.small}' */
        box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.5);
        /* or 'box-shadow: ${theme.global.elevation.light.medium}' */
      `,
    },
    panel: {
      extend: ({ theme }) => css`
        padding: 48px;
        /* or 'padding: ${theme.global.edgeSize.large}' */
        box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.5);
        /* or 'box-shadow: ${theme.global.elevation.light.medium}' */
      `,
    },
  },
  text: {
    small: {
      size: '12pt'
    }
  },
});


const RichTabTitle = ({ icon, label }) => (
  <Box direction="row" align="center" gap="xsmall" margin="xsmall" justify="center" >
    {icon}
    <Text color="#000000" >
      <strong>{label}</strong>
    </Text>
  </Box>
);


  return (
    <Grommet full theme={customTheme}  >
    {this.state.uninstallDialog && <Layer>
    <Box pad="medium" direction="column" >
       <Text pad="medium" className="dialogMessage" >Are you sure you want to uninstall {this.state.currentExt.name}?</Text>
       <Box pad="medium" direction="row" justify="between" >
       <Button label="Remove" icon={<Trash />} onClick={this.uninstallClick} color="sdark" />
       <Button label="Cancel" onClick={this.hideDialog} color="brand" />
       </Box>
    </Box>
    </Layer>}

    {(!(this.state.installedLoaded && this.state.availableLoaded && this.state.configLoaded && this.state.configSchemaLoaded && this.state.extInfoLoaded)) && <Layer>
    <Box pad="medium" direction="row" >
        <Spinner margin="small"
        border={[
          { side: 'all', color: 'transparent', size: 'medium' },
          { side: 'horizontal', color: 'brand', size: 'medium' },
        ]}
        />
        <Text margin="small" align="top" >Loading...</Text>
       </Box>
    </Layer>}
    <Tabs>
    <Tab title={<RichTabTitle label="Installed" icon={<Configure color="#121212" />} />} onClick={this.tabSelected} >
     <Box >
       {this.state.needRestart && this.renderChanges()}
       {(this.state.currentExt.name == '') && this.renderInstalledGrid()}
       {(this.state.currentExt.name != '') && this.renderExt()}
     </Box>
     </Tab>
     <Tab title={<RichTabTitle label="Available" icon={<Install color="#121212" />} />} >
       {this.state.needRestart && this.renderChanges()}
       {(this.state.currentExt.name == '') && this.renderAvailableGrid()}
       {(this.state.currentExt.name != '') && this.renderExt()}
     </Tab>
   </Tabs>
   </Grommet>
  );
}
}

export default App;
