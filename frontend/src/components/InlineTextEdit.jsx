import React, { useState } from "react";
import { Avatar, 
         Button,
         Center, 
         Group, 
         Loader, 
         Text,
         TextInput, } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import PropTypes from "prop-types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { IconPencil } from "@tabler/icons-react";


export default function InlineTextEdit(props) {

    console.log("InlineTextEdit - at top - props is:");
    console.log(props);

    const [editing, setEditing] = useState(false);

    //Content for the Edit field

    let editFieldContent = 
        <Text size={props.size} fw={props.fontWeight} c={props.color} onClick={()=>setEditing(true)}>{props.text}+InText</Text>;     
    
    if (editing){
        editFieldContent = 
        <TextInput size={props.size} fw={props.fontWeight} c={props.color} value={props.text+"inTextInput"} onBlur={()=>setEditing(false)}/>
    }
        
    return (
        <Group>
            {editFieldContent}
            <IconPencil strokeWidth={2} color={props.color}/>
        </Group>       
    );

}

InlineTextEdit.propTypes = {
    text: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    fontWeight: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
};