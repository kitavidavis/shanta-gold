import { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import {
  AppShell,
  Header,
  Footer,
  Aside,
  Text,
  MediaQuery,
  useMantineTheme,
  Title,
  Center,
  SimpleGrid,
  Paper,
  Group,
  RingProgress,
  Table,
  Anchor,
  Grid,
  Box,
  Switch,
  Select,
  Stack,
  Button
} from '@mantine/core';
import { MantineProvider, ColorSchemeProvider, ColorScheme, createStyles, Input } from '@mantine/core';
import { useColorScheme, useViewportSize } from '@mantine/hooks';
import { MapContainer, TileLayer, useMapEvents, LayersControl,  GeoJSON, Circle, LayerGroup } from 'react-leaflet'
import license from './geodata/license';
import license2 from './geodata/license2';
import { AdjustmentsHorizontal, ArrowUpRight, ChartArea, Logout } from 'tabler-icons-react';
import L, { LatLngExpression } from "leaflet"
import drills from './geodata/drill_colars';
import { latLng } from 'leaflet';
import artisanal from './geodata/artisanal_workings';
import artisanal2 from './geodata/artisanal2';
import sublocations from './geodata/sublocations';
import alloutlineareas from './geodata/AllOutlineAreas';
import EthnicClans from './geodata/EthnicClans';
import Ramula1 from './geodata/ramula';
import Ramula2 from "./geodata/Ramula-option2";
import RamulaOption3 from './geodata/Ramula-Option3';
import DheneRamulaOption from './geodata/Dhene-Ramula-Options';
import Powerlines from "./geodata/Powerlines";
import Powerlines11 from "./geodata/PowerLines-11";
import { Transformers1, Transformers2, Transformers3 } from "./geodata/electricity-distribution-transformers";
import Streams from "./geodata/Streams";
import PrimarySubstations from "./geodata/primary-substations";
import BuildingFootprints from "./geodata/building-footprints";
import { AuthContext } from "./App";

const turf = require("@turf/turf");

const useStyles = createStyles((theme) => ({
  header: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },

  inner: {
    height: 70,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  search: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  navbar: {
      paddingTop: 0,
    },
  
    section: {
      marginLeft: -theme.spacing.md,
      marginRight: -theme.spacing.md,
      marginBottom: theme.spacing.md,
  
    },
  
    searchCode: {
      fontWeight: 700,
      fontSize: 10,
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
      border: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[2]
      }`,
    },
  
    mainLinks: {
      paddingLeft: theme.spacing.md - theme.spacing.xs,
      paddingRight: theme.spacing.md - theme.spacing.xs,
      paddingBottom: theme.spacing.md,
    },
  
    mainLink: {
      display: 'flex',
      cursor: 'text',
      alignItems: 'center',
      width: '100%',
      fontSize: theme.fontSizes.xs,
      padding: `8px ${theme.spacing.xs}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
  
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      },
    },
  
    mainLinkInner: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
    },
  
    mainLinkIcon: {
      marginRight: theme.spacing.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
    },
  
    mainLinkBadge: {
      padding: 0,
      width: 20,
      height: 20,
      pointerEvents: 'none',
    },
  
    collections: {
      paddingLeft: theme.spacing.md - 6,
      paddingRight: theme.spacing.md - 6,
      paddingBottom: theme.spacing.md,
    },
  
    collectionsHeader: {
      paddingLeft: theme.spacing.md + 2,
      paddingRight: theme.spacing.md,
      marginBottom: 5,
    },

    root: {
      position: 'relative',
      '& *': {
        cursor: 'pointer',
      },
    },
  
    collectionLink: {
      display: 'block',
      padding: `8px ${theme.spacing.xs}px`,
      textDecoration: 'none',
      cursor: 'text',
      borderRadius: theme.radius.sm,
      fontSize: theme.fontSizes.xs,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
      lineHeight: 1,
      fontWeight: 500,
  
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      },
    },
}));


export default function Dashboard() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  const { height, width} = useViewportSize();
  const [collapsed, setCollapsed] = useState(true)
  const [activeOutline, setActiveOutline] = useState("");
  const preferredColorScheme = useColorScheme();
  const [totaldrills, setTotalDrills] = useState(drills.features.length)
  const [totalartisanal, setTotalArtisanal] = useState(artisanal.features.length + artisanal2.features.length)
  const [totalboundaries, setTotalBoundaries] = useState(license2.features.length)
  const [toggled, setToggled] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [area, setArea] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [ready, setReady] = useState(false);
  const [seamless, setSeamless] = useState(false);
  const [center, setCenter] = useState<any>([-0.003, 34.515979]);
  const [zoom, setZoom] = useState<number>(13)
  const [basemap, setBasemap] = useState(false);
  const [boundary, setBoundary] = useState<string>("0");
  const [showbuildings, setShowBuildings] = useState(true);
  const [prints1, setPrints1] = useState<number>(0);
  const [prints2, setPrints2] = useState<any>(null);
  const [prints3, setPrints3] = useState<any>(null);
  const [prints4, setPrints4] = useState<any>(null);
  const [prints5, setPrints5] = useState<any>(null);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
  const { state, dispatch } = useContext(AuthContext);

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    setColorScheme(preferredColorScheme)
  }, [preferredColorScheme])

  useEffect(() => {
    const preprocess = () => {
          let idx = Ramula1.features.findIndex((obj => obj.properties.Name === "Property Area Ramula_450ha"))
          if(idx === -1) {
            return false;
          }
  
          var poly = turf.polygon(Ramula1.features[idx].geometry.coordinates[0]);
          let arr = [];
  
          for(let i=0; i<BuildingFootprints.features.length; i++){
            let pt = turf.polygon(BuildingFootprints.features[i].geometry.coordinates[0]);
            let centroid = turf.centroid(pt);
  
            if(turf.booleanPointInPolygon(centroid, poly)){
              arr.push(BuildingFootprints.features[i]);
            }
          }
  
          setPrints1(arr.length)
      }

      const preprocess2 = () => {
        let idx = Ramula2.features.findIndex((obj => obj.properties.Name === "Ramula Option2 Property Boundary"))
        if(idx === -1) {
          return false;
        }

        var poly = turf.polygon(Ramula2.features[idx].geometry.coordinates[0]);
        let arr = [];

        for(let i=0; i<BuildingFootprints.features.length; i++){
          let pt = turf.polygon(BuildingFootprints.features[i].geometry.coordinates[0]);
          let centroid = turf.centroid(pt);

          if(turf.booleanPointInPolygon(centroid, poly)){
            arr.push(BuildingFootprints.features[i]);
          }
        }

        setPrints2(arr.length)
    }

    const preprocess3 = () => {
      let idx = RamulaOption3.features.findIndex((obj => obj.properties.Name === "Ramula Option 3 Property boundary"))
      if(idx === -1) {
        return false;
      }

      var poly = turf.polygon(RamulaOption3.features[idx].geometry.coordinates[0]);
      let arr = [];

      for(let i=0; i<BuildingFootprints.features.length; i++){
        let pt = turf.polygon(BuildingFootprints.features[i].geometry.coordinates[0]);
        let centroid = turf.centroid(pt);

        if(turf.booleanPointInPolygon(centroid, poly)){
          arr.push(BuildingFootprints.features[i]);
        }
      }

      setPrints3(arr.length)
  }

  const preprocess4 = () => {

    var poly = turf.polygon(DheneRamulaOption.features[0].geometry.coordinates[0]);
    let arr = [];

    for(let i=0; i<BuildingFootprints.features.length; i++){
      let pt = turf.polygon(BuildingFootprints.features[i].geometry.coordinates[0]);
      let centroid = turf.centroid(pt);

      if(turf.booleanPointInPolygon(centroid, poly)){
        arr.push(BuildingFootprints.features[i]);
      }
    }

    setPrints4(arr.length)
  }

  const preprocess5 = () => {

    var poly = turf.polygon(DheneRamulaOption.features[1].geometry.coordinates[0]);
    let arr = [];

    for(let i=0; i<BuildingFootprints.features.length; i++){
      let pt = turf.polygon(BuildingFootprints.features[i].geometry.coordinates[0]);
      let centroid = turf.centroid(pt);

      if(turf.booleanPointInPolygon(centroid, poly)){
        arr.push(BuildingFootprints.features[i]);
      }
    }

    setPrints5(arr.length)
  }

    preprocess();
    preprocess2();
    preprocess3();
    preprocess4();
    preprocess5();
  }, []);

  const styleDrills = () => {
    return {
      weight: 2,
			opacity: 1,
			color: 'white',
      fillColor: '#feebe2',
			dashArray: '3',
			fillOpacity: 0.7,
			interactive: true,
      backgroundColor: 'red'
  }
  }

  const outlineArr = [];

  for(let i=0; i<alloutlineareas.features.length; i++){
    outlineArr.push({label: alloutlineareas.features[i].properties.Name, value: alloutlineareas.features[i].properties.Name})
  }

  const links = 
    {
      label: 'Filter Outline Areas',
      data: outlineArr
    }

  const languages = new Set();

  for(let i=0; i<EthnicClans.features.length; i++){
      languages.add(EthnicClans.features[i].properties.LANGUAGE);
  }

  const languageColorObject: {color: string, language: any}[] = [];

  languages.forEach(function(value: any){
    let randomColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
    let chunk = {color: randomColor, language: value};
    languageColorObject.push(chunk);
  })

  const featureColor = (name: string) => {
    let idx = languageColorObject.findIndex((obj => obj.language === name));
    if(idx !== -1){
      let obj = languageColorObject[idx];

      return obj.color
    }
  }

  const calculateArea = (obj: any, str: string) => {
    setActive(obj);
    let polygon = turf.polygon(obj.geometry.coordinates[0]);
    let area = turf.area(polygon);

    setArea(area);
    setCategory(str);
    setReady(true);
  }

  const resetToDefaults = () => {
    setReady(false);
    setArea(0);
    setCategory("");
  }

  const handleCategory = (str: string) => {
    switch(str){
      case "0":
        return "Ramula Option One";
      case "1":
        return "Ramula Option Two";
      case "2":
        return "Ramula Option Three";
      case "3":
        return "Dhene-Ramula Option";
      default:
        return "Processing..."
    }
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>

      <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      aside={

          <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
          <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 300, lg: 400 }}>
            <Switch mb={30} mt={10} label="Show Building Statistics" checked={showbuildings} onChange={() => {setShowBuildings(!showbuildings)}} />
            {showbuildings ? (
              <>
              <Text mb={15}>Total Buildings:<strong>{BuildingFootprints.features.length}</strong> </Text>
            <Paper withBorder radius="md" p="xs">
            <Group>
            <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: (prints1 / BuildingFootprints.features.length) * 100, color: "cyan" }]}
            label={
              <Center>
                <ArrowUpRight />
              </Center>
            }
          />
    
              <div>
                <Text color="dimmed">
                  Ramula Option 1
                </Text>
                <Text weight={700} size="xl" >
                {prints1}
                </Text>
              </div>
            </Group>
          </Paper>
          <Paper mt="md" withBorder radius="md" p="xs">
            <Group>
            <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: (prints2 / BuildingFootprints.features.length) * 100, color: "cyan" }]}
            label={
              <Center>
                <ArrowUpRight />
              </Center>
            }
          />
    
              <div>
                <Text color="dimmed">
                  Ramula Option 2
                </Text>
                <Text weight={700} size="xl" >
                {prints2}
                </Text>
              </div>
            </Group>
          </Paper>

          <Paper mt="md" withBorder radius="md" p="xs">
            <Group>
            <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: (prints3 / BuildingFootprints.features.length) * 100, color: "cyan" }]}
            label={
              <Center>
                <ArrowUpRight />
              </Center>
            }
          />
    
              <div>
                <Text color="dimmed">
                  Ramula Option 3
                </Text>
                <Text weight={700} size="xl" >
                {prints3}
                </Text>
              </div>
            </Group>
          </Paper>

          <Paper mt="md" withBorder radius="md" p="xs">
            <Group>
            <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: (prints3 / BuildingFootprints.features.length) * 100, color: "cyan" }]}
            label={
              <Center>
                <ArrowUpRight />
              </Center>
            }
          />
    
              <div>
                <Text color="dimmed">
                  Dhene Ramula Option
                </Text>
                <Text weight={700} size="xl" >
                {prints4 + prints5}
                </Text>
              </div>
            </Group>
          </Paper>
          </>
            ) : null}
          {ready && !showbuildings ? (  
            <>
          <Title mb={30} order={4}>Summary Information</Title>
              <Text mb={20}>Category: <strong>{handleCategory(category)}</strong></Text>
                          <SimpleGrid cols={1} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                          <Paper withBorder radius="md" p="xs">
                      <Group>
                      <AdjustmentsHorizontal />
              
                        <div>
                          <Text color="dimmed" transform="uppercase" weight={700}>
                            Name:
                          </Text>
                          <Text>
                          {active.properties.Name}
                          </Text>
                        </div>
                      </Group>
                    </Paper>
                    <Paper withBorder radius="md" p="xs">
                      <Group>
                        <ChartArea size={40} />
              
                        <div>
                          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                            Total Area
                          </Text>
                          <Text weight={700} size="xl">
                            {(area / 10000).toFixed(2) + "Ha / "+(area / 4046.86).toFixed(2) + "Acres" }
                          </Text>
                        </div>
                      </Group>
                    </Paper>
              
                          </SimpleGrid>
                          </>
            ) : null}
          
          </Aside>
        </MediaQuery>
      }
      footer={
        <Footer height={60} p="md">
          <Group position='apart'>
            <Group position='left'>
              <Text>@Shanta Gold. All rights reserved.</Text>
            </Group>
            <Group position='right'>
              <Anchor href="https://geopsyresearch.org" target="_blank">Made By GeoPsy Research</Anchor>
            </Group>
          </Group>
        </Footer>
      }
      header={
        <Header height={70} className={classes.header}>
          <div className={classes.inner}>
            <Group style={{marginTop: 10}} >
            <Title>Shanta Gold</Title>
            </Group>

            <Group ml={50} spacing={5} className={classes.links}>
              
          </Group>
          
          <MediaQuery smallerThan="md" styles={{display: "none"}}>
          <Group>
            <Switch label={basemap ? "Hide Basemap" : "Show Basemap"} checked={basemap} onChange={() => setBasemap(!basemap)} size="md" />
            <Button onClick={() => {dispatch({type: "SIGN_OUT"})}} variant="subtle" color="red" leftIcon={<Logout />}>Logout</Button>
        </Group>
          </MediaQuery>
          </div>
        </Header>
      }
    >

<MapContainer style={{height: '100%', width: '100%', backgroundColor: "black", padding: 0}} center={center} zoom={zoom}  scrollWheelZoom={true}>
<LayersControl collapsed={collapsed} position='topright'>
      {basemap ? (
        <>
            <LayersControl.BaseLayer checked={basemap} name='OSM'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url= "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
    />
    </LayersControl.BaseLayer>
    <LayersControl.BaseLayer name='CartoDB'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
    />
    </LayersControl.BaseLayer>
    <LayersControl.BaseLayer name='Satellite'>
    <TileLayer
      attribution='&copy; Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />
    </LayersControl.BaseLayer>
        </>
      ) : null}
    <LayersControl.Overlay checked name="Building Footprints" >
    <GeoJSON data={BuildingFootprints}  pointToLayer={(f, latLng) => {
      return new L.CircleMarker(latLng, {
        opacity: 1,
        weight: 2,
        color: '#E9ECEF',
        fillColor: '#E9ECEF',
        fillOpacity: 1,
        radius: 15
      })
    }} />
  </LayersControl.Overlay>

    <LayersControl.Overlay checked name="Ramula Option 1">
    <LayerGroup>
    {Ramula1.features.filter((item) => {
        return item.properties.Name === "Property Area Ramula_450ha"
      }).map((item: any, index: number) => {
        return (
          <GeoJSON style={(feature) => {
            return {
              opacity: 1,
              weight: 2,
              dashArray: "5, 5",
              color: "white",
              fillColor: "transparent"
            }
          }} data={item} onEachFeature={(feature, layer) => {
            layer.on({
              click: function(e) {
                calculateArea(feature, "0");
              },

              mouseover: function(e) {
                  e.target.setStyle({
                    color: "#D9480F"
                  });
                  calculateArea(feature, "0");
              },

              mouseout: function(e){
                  e.target.setStyle({
                    color: "white"
                  });

                  resetToDefaults();
                }

            })
        }} />
        )
      })}

      {Ramula1.features.filter((item) => {
        return item.properties.Name !== "Property Area Ramula_450ha"
      }).map((item: any, index: number) => {
        return (
          <GeoJSON key={index} style={(feature) => {
            return {
              opacity: 1,
              weight: 2,
              fillOpacity: 1,

              color: "white",
              fillColor: "transparent"
            }
          }} data={item} onEachFeature={(feature: any, layer: any) => {
            layer.on({
              click: function(e:any) {
                calculateArea(feature, "0");
              },

              mouseover: function(e:any) {
                  e.target.setStyle({
                    color: "#D9480F"
                  });
                  calculateArea(feature, "0");
              },

              mouseout: function(e:any){
                  e.target.setStyle({
                    color: "white"
                  });
                  resetToDefaults();
                }

            })
        }}/>
        )
      })}
      </LayerGroup>
  </LayersControl.Overlay>
  <LayersControl.Overlay checked name="Ramula Option 2">
  <LayerGroup>
    {Ramula2.features.filter((item) => {
      return item.properties.Name === "Ramula Option2 Property Boundary"
    }).map((item: any, index: number) => {
      return (
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 2,
            dashArray: "5, 5",
            color: "white",
            fillColor: "transparent"
          }
        }} data={item} onEachFeature={(feature, layer) => {
          layer.on({
            click: function(e) {
              calculateArea(feature, "1");
            },

            mouseover: function(e) {
                e.target.setStyle({
                  color: "#D9480F"
                });
                calculateArea(feature, "1");
            },

            mouseout: function(e){
                e.target.setStyle({
                  color: "white"
                });
                resetToDefaults();
              }

          })
      }} />
      )
    })}

    {Ramula2.features.filter((item) => {
      return item.properties.Name !== "Ramula Option2 Property Boundary"
    }).map((item: any, index: number) => {
      return (
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 2,
            color: "white",
            fillColor: "transparent"
        }
        }} data={item} onEachFeature={(feature, layer) => {
          layer.on({
            click: function(e) {
              calculateArea(feature, "1");
            },

            mouseover: function(e) {
                e.target.setStyle({
                  color: "#D9480F"
                });
                calculateArea(feature, "1");
            },

            mouseout: function(e){
                e.target.setStyle({
                  color: "white"
                });
                resetToDefaults();
              }

          })
      }} />
      )
    })}
  </LayerGroup>
</LayersControl.Overlay>
  <LayersControl.Overlay checked name="Ramula Option 3">
  <LayerGroup>
    {RamulaOption3.features.filter((item) => {
      return item.properties.Name === "Ramula Option 3 Property boundary"
    }).map((item: any, index: any) => {
      return (
        <GeoJSON style={(feature) => {
          return {
            color: "white",
            dashArray: "5, 5",
            fillColor: "transparent",
            weight: 2,
            opacity: 1
          }
        }} data={item} onEachFeature={(feature, layer) => {
          layer.on({
            click: function(e) {
              calculateArea(feature, "2");
            },

            mouseover: function(e) {
                e.target.setStyle({
                  color: "#D9480F"
                });
                calculateArea(feature, "2");
            },

            mouseout: function(e){
                e.target.setStyle({
                  color: "white"
                });
                resetToDefaults();
              }

          })
      }} />
      )
    })}

    {RamulaOption3.features.filter((item) => {
      return item.properties.Name !== "Ramula Option 3 Property boundary"
    }).map((item: any, index: any) => {
      return (
        <GeoJSON style={(feature) => {
          return {
            color: "white",
            fillColor: "transparent",
            weight: 2,
            opacity: 1
          }
        }} data={item} onEachFeature={(feature, layer) => {
          layer.on({
            click: function(e) {
              calculateArea(feature, "2");
            },

            mouseover: function(e) {
                e.target.setStyle({
                  color: "#D9480F"
                });
                calculateArea(feature, "2");
            },

            mouseout: function(e){
                e.target.setStyle({
                  color: "white"
                });
                resetToDefaults();
              }

          })
      }} />
      )
    })}
  </LayerGroup>
</LayersControl.Overlay>
  <LayersControl.Overlay checked name="Dhene-Ramula Option">
    <LayerGroup>
      {DheneRamulaOption.features.map((item: any, index: number) => {
        return (
          <GeoJSON style={(feature) => {
            return {
              color: "white",
              fillColor: "transparent",
              weight: 2,
              opacity: 1
            }
          }} data={item} onEachFeature={(feature, layer) => {
            layer.on({
              click: function(e) {
                calculateArea(feature, "3");
              },
  
              mouseover: function(e) {
                  e.target.setStyle({
                    color: "#D9480F"
                  });
                  calculateArea(feature, "3");
              },
  
              mouseout: function(e){
                  e.target.setStyle({
                    color: "white"
                  });
                  resetToDefaults();
                }
  
            })
        }} />
        )
      })}
    </LayerGroup>
  </LayersControl.Overlay>
  <LayersControl.Overlay checked name="Electricity Distribution Transformers" >
    <LayerGroup>
      <GeoJSON data={Transformers1} onEachFeature={(f, l) => {
            l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>RCC1</strong></td><td>"+f.properties.RCC1+"</td></tr><tr scope='row'><td><strong>County2</strong></td><td>"+f.properties.County2+"</td></tr><tr scope='row'><td><strong>Branch3</strong></td><td>"+f.properties.Branch3+"</td></tr><tr scope='row'><td><strong>Substation9</strong></td><td>"+f.properties.Substati9+"</td></tr><tr scope='row'><td><strong>DCS_Cate15</strong></td><td>"+f.properties.DCS_Cate15+"</td></tr><tr scope='row' ><td><strong>Modifyin25</strong></td><td>"+f.properties.Modifyin25+"</td></tr><tr scope='row' ><td><strong>Origin_o27</strong></td><td>"+f.properties.Origin_o27+"</td></tr><tr scope='row'><td><strong>Feeder_o28</strong></td><td>"+f.properties.Feeder_o28+"</td></tr><tr scope='row'><td><strong>Substation29</strong></td><td>"+f.properties.Substati29+"</td></tr><tr scope='row'><td><strong>HT_Isola32</strong></td><td>"+f.properties.HT_Isola32+"</td></tr><tr scope='row'><td><strong>Road_Str38</strong></td><td>"+f.properties.Road_Str38+"</td></tr><tr scope='row'><td><strong>Physical39</strong></td><td>"+f.properties.Physical39+"</td></tr><tr scope='row'><td><strong>Road</strong></td><td>"+f.properties.Road+"</td></tr></tbody><table>");
        }} pointToLayer={(f, latLng) => {
          return new L.CircleMarker(latLng, {
            opacity: 1,
            weight: 2,
            color: 'yellow',
            fillColor: 'yellow',
            radius: 3
          })
        }}   />
      <GeoJSON data={Transformers2} onEachFeature={(f, l) => {
            l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>RCC1</strong></td><td>"+f.properties.RCC1+"</td></tr><tr scope='row'><td><strong>County2</strong></td><td>"+f.properties.County2+"</td></tr><tr scope='row'><td><strong>Branch3</strong></td><td>"+f.properties.Branch3+"</td></tr><tr scope='row'><td><strong>Substation9</strong></td><td>"+f.properties.Substati9+"</td></tr><tr scope='row'><td><strong>DCS_Cate15</strong></td><td>"+f.properties.DCS_Cate15+"</td></tr><tr scope='row' ><td><strong>Modifyin25</strong></td><td>"+f.properties.Modifyin25+"</td></tr><tr scope='row' ><td><strong>Origin_o27</strong></td><td>"+f.properties.Origin_o27+"</td></tr><tr scope='row'><td><strong>Feeder_o28</strong></td><td>"+f.properties.Feeder_o28+"</td></tr><tr scope='row'><td><strong>Substation29</strong></td><td>"+f.properties.Substati29+"</td></tr><tr scope='row'><td><strong>HT_Isola32</strong></td><td>"+f.properties.HT_Isola32+"</td></tr><tr scope='row'><td><strong>Road_Str38</strong></td><td>"+f.properties.Road_Str38+"</td></tr><tr scope='row'><td><strong>Physical39</strong></td><td>"+f.properties.Physical39+"</td></tr><tr scope='row'><td><strong>Road</strong></td><td>"+f.properties.Road+"</td></tr></tbody><table>");
        }} pointToLayer={(f, latLng) => {
          return new L.CircleMarker(latLng, {
            opacity: 1,
            weight: 2,
            color: 'yellow',
            fillColor: 'yellow',
            radius: 3
          })
        }}  />
      <GeoJSON data={Transformers3} onEachFeature={(f, l) => {
            l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>RCC1</strong></td><td>"+f.properties.RCC1+"</td></tr><tr scope='row'><td><strong>County2</strong></td><td>"+f.properties.County2+"</td></tr><tr scope='row'><td><strong>Branch3</strong></td><td>"+f.properties.Branch3+"</td></tr><tr scope='row'><td><strong>Substation9</strong></td><td>"+f.properties.Substati9+"</td></tr><tr scope='row'><td><strong>DCS_Cate15</strong></td><td>"+f.properties.DCS_Cate15+"</td></tr><tr scope='row' ><td><strong>Modifyin25</strong></td><td>"+f.properties.Modifyin25+"</td></tr><tr scope='row' ><td><strong>Origin_o27</strong></td><td>"+f.properties.Origin_o27+"</td></tr><tr scope='row'><td><strong>Feeder_o28</strong></td><td>"+f.properties.Feeder_o28+"</td></tr><tr scope='row'><td><strong>Substation29</strong></td><td>"+f.properties.Substati29+"</td></tr><tr scope='row'><td><strong>HT_Isola32</strong></td><td>"+f.properties.HT_Isola32+"</td></tr><tr scope='row'><td><strong>Road_Str38</strong></td><td>"+f.properties.Road_Str38+"</td></tr><tr scope='row'><td><strong>Physical39</strong></td><td>"+f.properties.Physical39+"</td></tr><tr scope='row'><td><strong>Road</strong></td><td>"+f.properties.Road+"</td></tr></tbody><table>");
        }} pointToLayer={(f, latLng) => {
          return new L.CircleMarker(latLng, {
            opacity: 1,
            weight: 2,
            color: 'yellow',
            fillColor: 'yellow',
            radius: 3
          })
        }}   />
    </LayerGroup>
  </LayersControl.Overlay>

  <LayersControl.Overlay checked name="Power Transmission Lines(33KV)" >
    <GeoJSON data={Powerlines} style={(feature) => {
      return {
        color: "blue",
        fillColor: "blue",
        weight: 2
      }
    }} onEachFeature={(f, l) => {
      l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>RCC1</strong></td><td>"+f.properties.RCC1+"</td></tr><tr scope='row'><td><strong>County2</strong></td><td>"+f.properties.County2+"</td></tr><tr scope='row'><td><strong>Branch3</strong></td><td>"+f.properties.Branch3+"</td></tr><tr scope='row' ><td><strong>Origin_o20</strong></td><td>"+f.properties.Origin_o20+"</td></tr><tr scope='row'><td><strong>Feeder_o21</strong></td><td>"+f.properties.Feeder_o21+"</td></tr><tr scope='row'><td><strong>Voltage48</strong></td><td>"+f.properties.voltage48+"</td></tr><tr scope='row'><td><strong>Length(m)</strong></td><td>"+f.properties.Length_m_+"</td></tr></tbody><table>");
  }} />
  </LayersControl.Overlay>

  <LayersControl.Overlay checked name="Power Transmission Lines(11KV)" >
    <GeoJSON data={Powerlines11} style={(feature) => {
      return {
        color: "red",
        fillColor: "red",
        weight: 2
      }
    }} onEachFeature={(f, l) => {
      l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>RCC1</strong></td><td>"+f.properties.RCC1+"</td></tr><tr scope='row'><td><strong>County2</strong></td><td>"+f.properties.County2+"</td></tr><tr scope='row'><td><strong>Branch3</strong></td><td>"+f.properties.Branch3+"</td></tr><tr scope='row' ><td><strong>Origin_o20</strong></td><td>"+f.properties.Origin_o20+"</td></tr><tr scope='row'><td><strong>Feeder_o21</strong></td><td>"+f.properties.Feeder_o21+"</td></tr><tr scope='row'><td><strong>Voltage48</strong></td><td>"+f.properties.voltage48+"</td></tr><tr scope='row'><td><strong>Length(m)</strong></td><td>"+f.properties.Length_m_+"</td></tr></tbody><table>");
  }} />
  </LayersControl.Overlay>

  <LayersControl.Overlay checked name="Streams" >
    <GeoJSON data={Streams} style={(feature) => {
      return {
        color: "#3BC9DB",
        fillColor: "#3BC9DB",
        weight: 0.5
      }
    }} onEachFeature={(f, l) => {
      l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>Name</strong></td><td>"+f.properties.NAME+"</td></tr></tbody><table>");
  }} />
  </LayersControl.Overlay>

  <LayersControl.Overlay checked name="Primary Substations" >
    <GeoJSON data={PrimarySubstations}  pointToLayer={(f, latLng) => {
      return new L.CircleMarker(latLng, {
        opacity: 1,
        weight: 2,
        color: '#5C940D',
        fillColor: '#5C940D',
        fillOpacity: 1,
        radius: 15
      })
    }}  onEachFeature={(f, l) => {
      l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>Name</strong></td><td>"+f.properties.Location41+"</td></tr></tbody><table>");
  }} />
  </LayersControl.Overlay>

{/*
  <LayersControl.Overlay name='Ethnic Clans'>
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            color: featureColor(feature?.properties.LANGUAGE),
            fillColor: featureColor(feature?.properties.LANGUAGE)
          }
        }} data={EthnicClans} />
        </LayersControl.Overlay>
        <LayersControl.Overlay name='Sublocations'>
        <GeoJSON onEachFeature={(f, l) => {
        let PROSPECT = f.properties.NAME;
        l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>Name</strong></td><td>"+PROSPECT+"</td></tr></tbody><table>");

        }} style={(feature) => {
          return {
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            color: '#F1F3F5',
            fillColor: '#FFD43B'
          }
        }} data={sublocations} />
        </LayersControl.Overlay>
        <LayersControl.Overlay name='License Boundary'>
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            color: 'black',
            fillColor: 'transparent'
          }
        }} data={license2} />
        </LayersControl.Overlay>
        <LayersControl.Overlay name='All outline areas'>
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            color: '#862E9C',
            fillColor: '#862E9C'
          }
        }} data={alloutlineareas} />
        </LayersControl.Overlay>

      */}
  </LayersControl>
</MapContainer>
    </AppShell>
    </MantineProvider>
    </ColorSchemeProvider>
  );
}