import React, { useState } from "react";
import { Avatar, 
         Button,
         Center, 
         Group, 
         Loader, 
         Text,
         TextInput, } from "@mantine/core";
import { useFocusTrap, useMediaQuery } from "@mantine/hooks";
import PropTypes from "prop-types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { IconCircleCheck, IconCircleX, IconPencil } from "@tabler/icons-react";


export default function InlineTextEdit(props) {

    console.log("InlineTextEdit - at top - props is:");
    console.log(props);

    const focusTrapRef = useFocusTrap();

    const [value, setValue] = useState(props.text);
    const [editing, setEditing] = useState(false);


    //Content for the Edit field

    let editFieldContent = 
        <Group>
            <Text size={props.size} 
                // fw={props.fontWeight} 
                c={props.color} 
                style={{cursor:"pointer"}}
                onClick={()=>setEditing(true)}>{props.text}</Text>    
            <IconPencil strokeWidth={2} 
                        color={props.color} 
                        style={{cursor:"pointer"}}
                        onClick={()=>{
                            setValue(props.text);
                            setEditing(true);
                        }}/>
        </Group>
    
    if (editing){
        editFieldContent = 
        <Group>
            <TextInput size={props.size} 
                    // fw={props.fontWeight} 
                    color={props.color} 
                    value={value} 
                    ref={focusTrapRef}
                    data-autofocus
                    onEscap={()=>console.log("Escape pressed!")}
                    onChange={(event)=>setValue(event.currentTarget.value)}
                    // onBlur={()=>setEditing(false)}
                    />
            <IconCircleX color="red" 
                        //  size={props.size}
                         style={{cursor:"pointer"}}
                         onClick={()=>{
                            setValue(props.text)
                            setEditing(false);
                         }}/>
            <IconCircleCheck color="green" 
                            //  size={props.size}
                             style={{cursor:"pointer"}}
                             onClick={()=>{
                                props.onChange(value);
                                setEditing(false);
                             }}/>
            
        </Group>
    }
        
    return (
        <div>
            {editFieldContent}
        </div>    
    );

}

InlineTextEdit.propTypes = {
    text: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    fontWeight: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    onChange: PropTypes.object.isRequired,
};