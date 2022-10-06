import { useState, useContext } from "react";
import {
    PasswordInput,
    Paper,
    Title,
    Container,
    Button,
  } from '@mantine/core';
import { TOKEN } from "./constants";
import { AuthContext } from "./App";

function makeToken(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

function randomTokenLength(){
    return Math.floor(Math.random() * 21 + 30)
}

  export function AuthenticationPage() {
    const { state, dispatch } = useContext(AuthContext);
    const [pass, setPass] = useState<string>("");
    const handleLogin = () => {
        if(pass === TOKEN){
            dispatch({type: "SIGN_IN", token:makeToken(randomTokenLength()) })
        } else {
            alert("Invalid password")
        }
    }
    return (
      <Container size={420} my={40}>
        <Title
          align="center"
          sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
        >
          Access Control
        </Title>
  
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <PasswordInput value={pass} onChange={(e) => {setPass(e.currentTarget.value)}} label="Password" placeholder="" required mt="md" />
          <Button onClick={() => {handleLogin()}} fullWidth mt="xl">
            Continue
          </Button>
        </Paper>
      </Container>
    );
  }