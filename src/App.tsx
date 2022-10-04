import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Card,
  MultiSelect
} from '@mantine/core';
import { MantineProvider, ColorSchemeProvider, ColorScheme, createStyles, Input } from '@mantine/core';
import { useColorScheme, useViewportSize } from '@mantine/hooks';
import { MapContainer, TileLayer, useMapEvents, LayersControl,  GeoJSON, Circle, LayerGroup } from 'react-leaflet'
import license from './geodata/license';
import license2 from './geodata/license2';
import { AdjustmentsHorizontal, ArrowUpRight, ChartArea } from 'tabler-icons-react';
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
import { AnyCnameRecord } from 'dns';

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


export default function App() {
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
  const [center, setCenter] = useState<any>([0.004, 34.536979]);
  const [zoom, setZoom] = useState<number>(14)
  const [basemap, setBasemap] = useState(false);
  const [concurrent, setConcurrent] = useState(false);
  const [cats, setCats] = useState<any>([]);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    setColorScheme(preferredColorScheme)
  }, [preferredColorScheme])

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
          <Aside p="md" hiddenBreakpoint="sm" sx={(theme) => ({top: 0, bottom: 0, height: height})} width={{ sm: 300, lg: 400 }}>
          <Switch mb={10} label="Toggle Basemap" checked={basemap} onChange={() => setBasemap(!basemap)} size="md" />

          <Switch mb={10} label="Toggle Layer Control" checked={collapsed} onChange={() => setCollapsed(!collapsed)} size="md" />

            <Switch checked={concurrent} onChange={() => {
              setCats([]);
              setCategory("");
              setConcurrent(!concurrent)
            }} mb={10} label="Concurrent View" />
            <Input.Wrapper mb={30} label="Data Source" description="Choose data to show">
              {concurrent ? (
                <MultiSelect value={cats} onChange={setCats} data={[
                  {label: "Ramula Option One", value: "0"},
                {label: "Ramula Option 2", value: "1"},
                {label: "Ramula Option 3", value: "2"},
                {label: "Dhene-Ramula Option", value: "3"}
              ]} />
              ) : (
                              <Select value={category} onChange={(val: string) => {setCategory(val)}} data={[
                                {label: "Ramula Option One", value: "0"},
                              {label: "Ramula Option 2", value: "1"},
                              {label: "Ramula Option 3", value: "2"},
                              {label: "Dhene-Ramula Option", value: "3"}
                            ]} />
              )}
            </Input.Wrapper>
          {ready ? (  
            <Card sx={(theme) => ({bottom: 0,})} shadow="sm">
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
                            {(area / 10000).toFixed(2) + "Ha"}
                          </Text>
                        </div>
                      </Group>
                    </Paper>
              
                          </SimpleGrid>
                          </Card>
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
          
          <Group>
                </Group>
          </div>
        </Header>
      }
    >

<MapContainer style={{height: '100%', width: '100%', backgroundColor: "black"}} center={center} zoom={zoom}  scrollWheelZoom={true}>
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
{ !concurrent ? category === "0" ? (
    <LayersControl.Overlay checked={category === "0" || cats.includes("0") ? true : false} name="Ramula Option 1">
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
                }

            })
        }}/>
        )
      })}
      </LayerGroup>
  </LayersControl.Overlay>
) : category === "1" ? (
  <LayersControl.Overlay checked={category === "1" || cats.includes("1") ? true : false} name="Ramula Option 2">
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
              }

          })
      }} />
      )
    })}
  </LayerGroup>
</LayersControl.Overlay>
) : category === "2" ? (
  <LayersControl.Overlay checked={category === "2" || cats.includes("2") ? true : false} name="Ramula Option 3">
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
              }

          })
      }} />
      )
    })}
  </LayerGroup>
</LayersControl.Overlay>
) : category === "3" ? (
  <LayersControl.Overlay checked={category === "3" || cats.includes("3") ? true : false} name="Dhene-Ramula Option">
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
                }
  
            })
        }} />
        )
      })}
    </LayerGroup>
  </LayersControl.Overlay>
) : null : (
  cats.map((item:string, index:number) => {
    return (
      item === "0" ? (
        <LayersControl.Overlay checked={category === "0" || cats.includes("0") ? true : false} name="Ramula Option 1">
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
                    }
    
                })
            }}/>
            )
          })}
          </LayerGroup>
      </LayersControl.Overlay>
    ) : item === "1" ? (
      <LayersControl.Overlay checked={category === "1" || cats.includes("1") ? true : false} name="Ramula Option 2">
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
                  }
    
              })
          }} />
          )
        })}
      </LayerGroup>
    </LayersControl.Overlay>
    ) : item === "2" ? (
      <LayersControl.Overlay checked={category === "2" || cats.includes("2") ? true : false} name="Ramula Option 3">
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
                  }
    
              })
          }} />
          )
        })}
      </LayerGroup>
    </LayersControl.Overlay>
    ) : item === "3" ? (
      <LayersControl.Overlay checked={category === "3" || cats.includes("3") ? true : false} name="Dhene-Ramula Option">
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
                    }
      
                })
            }} />
            )
          })}
        </LayerGroup>
      </LayersControl.Overlay>
    ) : null
    )
  })
)}
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

        <LayersControl.Overlay name='Drills'>
        <GeoJSON data={drills} onEachFeature={(f, l) => {
            let DHID = f.properties.DHID;
            let DHtype = f.properties.DHtype;
            let CollarSurv = f.properties.CollarSurv;
            let PROSPECT = f.properties.PROSPECT;
            let TENEMENTID = f.properties.TENEMENTID;
            l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>DHID</strong></td><td>"+DHID+"</td></tr><tr scope='row'><td><strong>DHtype</strong></td><td>"+DHtype+"</td></tr><tr scope='row'><td><strong>CollarSurv</strong></td><td>"+CollarSurv+"</td></tr><tr scope='row'><td><strong>Prospect</strong></td><td>"+PROSPECT+"</td></tr><tr scope='row'><td><strong>Tenement ID</strong></td><td>"+TENEMENTID+"</td></tr></tbody><table>");
        }} pointToLayer={(f, latLng) => {
          return new L.CircleMarker(latLng, {
            opacity: 1,
            weight: 2,
            color: '#5F3DC4',
            fillColor: '#5F3DC4',
            radius: 3
          })
        }} />
        </LayersControl.Overlay>
        <LayersControl.Overlay name='Artisanal Workings - 1'>
        <GeoJSON data={artisanal} onEachFeature={(f, l) => {
        let PROSPECT = f.properties.PROSPECT;
        let LOCAL_NAME = f.properties.LOCAL_NAME;
        let TYPE = f.properties.TYPE;
        let COMMENT = f.properties.COMMENT === null ? 'N/A' : f.properties.COMMENT;
        l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>Prospect</strong></td><td>"+PROSPECT+"</td></tr><tr scope='row'><td><strong>Local Name</strong></td><td>"+LOCAL_NAME+"</td></tr><tr scope='row'><td><strong>Type</strong></td><td>"+TYPE+"</td></tr><tr scope='row'><td><strong>Comment</strong></td><td>"+COMMENT+"</td></tr></tbody><table>");

        }} pointToLayer={(f, latLng) => {
          return new L.CircleMarker(latLng, {
            opacity: 1,
            weight: 2,
            color: '#D9480F',
            fillColor: '#D9480F',
            radius: 3
          })
        }} />

        </LayersControl.Overlay>
        <LayersControl.Overlay name="Artisanal Workings-2">
        <GeoJSON data={artisanal2} onEachFeature={(f, l) => {
           let PROSPECT = f.properties.PROSPECT;
           let LOCAL_NAME = f.properties.LOCAL_NAME;
           let TYPE = f.properties.TYPE;
           let COMMENT = f.properties.COMMENT === null ? 'N/A' : f.properties.COMMENT;
           l.bindPopup("<table class='table' ><tbody><tr scope='row'><td><strong>Prospect</strong></td><td>"+PROSPECT+"</td></tr><tr scope='row'><td><strong>Local Name</strong></td><td>"+LOCAL_NAME+"</td></tr><tr scope='row'><td><strong>Type</strong></td><td>"+TYPE+"</td></tr><tr scope='row'><td><strong>Comment</strong></td><td>"+COMMENT+"</td></tr></tbody><table>");
   
        }} pointToLayer={(f, latLng) => {
          return new L.CircleMarker(latLng, {
            opacity: 1,
            weight: 2,
            color: '#D9480F',
            fillColor: '#D9480F',
            radius: 3
          })
        }} />
        </LayersControl.Overlay>
      */}
  </LayersControl>
</MapContainer>
    </AppShell>
    </MantineProvider>
    </ColorSchemeProvider>
  );
}