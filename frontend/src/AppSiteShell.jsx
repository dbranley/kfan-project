import React, { useState } from "react";

import {
  useMantineTheme,
  AppShell,
  Navbar,
  Text,
  Header,
  MediaQuery,
  Burger,
  Button,
  Group,
} from "@mantine/core";

import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";
import { IconHome, IconHomePlus, IconBookUpload } from "@tabler/icons-react";

import LightAndDarkModeButton from "./components/LightAndDarkModeButton";
import AuthButton from "./components/AuthButton";
import UploadPhotoCardPage from "./pages/UploadPhotoCardPage";
import PhotoCardDetailPage from "./pages/PhotoCardDetailPage";
import PhotoCardsGridPage from "./pages/PhotoCardsGridPage";
import { useQuery } from "@tanstack/react-query";
import { SESSION_EXPIRATION_TIME, getCurrentUser } from "./services/auth";

export default function AppSiteShell() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: SESSION_EXPIRATION_TIME
  });

  return (
    <Router>
    <AppShell
      styles={{
        header: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[2],
        },
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[2],
        //need to set minHeight here to avoid vertical scrollbar to appear 
        // - default is 100vh which does not leave room for 8px margin around entire page
        //   minHeight: "95vh",
          
        },
      }}
      navbarOffsetBreakpoint="md"
      navbar={
        <Navbar
          p="sm"
          hiddenBreakpoint="md"
          hidden={!opened}
          width={{ sm: 250 }}
        >
          <Navbar.Section grow mt="lg">
            <div>
                <Button component={Link} to="/" variant="subtle" compact
                        leftIcon={<IconHome size="1.3rem"/>} 
                        fullWidth display={"flex"} size="md" radius={0}
                  >All Photo Cards</Button>

                {currentUserQuery.status === "success" && 
                 currentUserQuery.data !== null && 
                 currentUserQuery.data.id !== 0 &&                      
                 <Button component={Link} to="/my-cards" variant="subtle" compact 
                 leftIcon={<IconHomePlus size="1.3rem"/>} 
                 fullWidth display={"inline-flex"} size="md" radius={0}
                 >My Photo Cards</Button>}                  

                {currentUserQuery.status === "success" && 
                 currentUserQuery.data !== null && 
                 currentUserQuery.data.id !== 0 &&   
                 <Button component={Link} to="/upload" variant="subtle" compact 
                 leftIcon={<IconBookUpload size="1.3rem"/>} 
                 fullWidth display={"inline-flex"} size="md" radius={0}
                 >Upload Photo Card</Button>}                                       
            </div>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={{ base: 50 }} p="md"
        sx={(theme) => ({
          // backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.orange[0],
          color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[9],
        })}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Group>
              <MediaQuery largerThan="md" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
              <Text align="left" size="xl">Photo Card Testing Site</Text>
            </Group>
            
            <Group>
                <AuthButton/>
                <LightAndDarkModeButton />
            </Group>
          </div>
        </Header>
      }
    >

        <Routes>
            <Route path="/" element={<PhotoCardsGridPage myCards={false}/>}/>
            <Route path="/my-cards" element={<PhotoCardsGridPage myCards={true}/>}/>
            <Route path="/upload" element={<UploadPhotoCardPage/>}/>
            <Route path="/card/:photoCardId" element={<PhotoCardDetailPage/>}/>
        </Routes>

    </AppShell>
    </Router>
  );
}
