import { useState, useEffect, useRef } from 'react';
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
  Stack
} from '@mantine/core';
import { MantineProvider, ColorSchemeProvider, ColorScheme, createStyles, Input } from '@mantine/core';
import { useColorScheme, useViewportSize } from '@mantine/hooks';
import { MapContainer, TileLayer, useMap, LayersControl,  GeoJSON, Circle } from 'react-leaflet'
import license from './geodata/license';
import license2 from './geodata/license2';
import { ArrowUpRight } from 'tabler-icons-react';
import L, { LatLngExpression } from "leaflet"
import drills from './geodata/drill_colars';
import { latLng } from 'leaflet';
import artisanal from './geodata/artisanal_workings';
import artisanal2 from './geodata/artisanal2';
import sublocations from './geodata/sublocations';
import alloutlineareas from './geodata/AllOutlineAreas';
import EthnicClans from './geodata/EthnicClans';

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

  const MapPanel = () => {
    return (
      <MapContainer style={{height: '100%', width: '100%'}} center={[0.142, 34.66]} zoom={activeOutline === "" ? 10 : 16}  scrollWheelZoom={true}>
      <LayersControl collapsed={collapsed} position='topright'>
  <LayersControl.BaseLayer checked name='OSM'>
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
  <LayersControl.Overlay checked name='Ethnic Clans'>
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            color: '#4263EB',
            fillColor: '#4263EB'
          }
        }} data={EthnicClans} />
        </LayersControl.Overlay>
  <LayersControl.Overlay checked name='License Boundary'>
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            color: '#ADB5BD',
            fillColor: '#ADB5BD'
          }
        }} data={license2} />
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name='Sublocations'>
        <GeoJSON style={(feature) => {
          return {
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            color: '#C2255C',
            fillColor: '#C2255C'
          }
        }} data={sublocations} />
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name='All outline areas'>
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

        <LayersControl.Overlay checked name='Drills'>
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
            color: '#FCC419',
            fillColor: '#FCC419',
            radius: 3
          })
        }} />
        </LayersControl.Overlay>
        <LayersControl.Overlay checked name='Artisanal Workings - 1'>
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
        <LayersControl.Overlay checked name="Artisanal Workings-2">
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
            color: 'yellow',
            fillColor: 'yellow',
            radius: 3
          })
        }} />
        </LayersControl.Overlay>
  </LayersControl>
</MapContainer>
    )
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
          <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
          <Text> Statistics</Text>
            <SimpleGrid cols={1} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
            <Paper withBorder radius="md" p="xs">
        <Group>
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: Math.floor((1/ 1) * 100), color: 'red' }]}
            label={
              <Center>
                <ArrowUpRight size={22} />
              </Center>
            }
          />

          <div>
            <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
              Drill Colars
            </Text>
            <Text weight={700} size="xl">
            {totaldrills}
            </Text>
          </div>
        </Group>
      </Paper>
      <Paper withBorder radius="md" p="xs">
        <Group>
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: Math.floor((1 / 1) * 100), color: 'yellow' }]}
            label={
              <Center>
                <ArrowUpRight size={22} />
              </Center>
            }
          />

          <div>
            <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
              Artisanal Workings
            </Text>
            <Text weight={700} size="xl">
              {totalartisanal}
            </Text>
          </div>
        </Group>
      </Paper>

      <Paper withBorder radius="md" p="xs">
        <Group>
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: Math.floor((1 / 1) * 100), color: 'blue' }]}
            label={
              <Center>
                <ArrowUpRight size={22} />
              </Center>
            }
          />

          <div>
            <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
              License Boundary
            </Text>
            <Text weight={700} size="xl">
              {totalboundaries}
            </Text>
          </div>
        </Group>
      </Paper>

            </SimpleGrid>
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
            <Title order={3}>Shanta Gold</Title>
            </Group>

            <Group ml={50} spacing={5} className={classes.links}>
              
          </Group>
          
          <Group>
      <div className={classes.root}>
        <Text>Toggle Layer control</Text>
      </div>
      <Switch checked={collapsed} onChange={() => setCollapsed(!collapsed)} size="md" />
    </Group>
          </div>
        </Header>
      }
    >
        <Grid  style={{height: height - 145}} columns={24}>
          <Grid.Col span={6}>
          <Stack justify='space-between' sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0], height: height - 150 })} >
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        textAlign: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,
        cursor: 'pointer',
        height: '100%',

        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        },
      })}
    >
      <Text>Properties</Text>
    </Box>
          </Stack>
          </Grid.Col>
          <Grid.Col span={18}>
            <MapPanel />
          </Grid.Col>
        </Grid>


    </AppShell>
    </MantineProvider>
    </ColorSchemeProvider>
  );
}