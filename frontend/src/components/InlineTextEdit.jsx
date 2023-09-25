import React, { useState } from "react";
import { Group, 
         Text,
         TextInput, } from "@mantine/core";
import { useFocusTrap } from "@mantine/hooks";
import PropTypes from "prop-types";
import { IconCircleCheck, IconCircleX, IconPencil } from "@tabler/icons-react";


export default function InlineTextEdit(props) {

    console.log("InlineTextEdit - at top - props is:");
    console.log(props);

    const focusTrapRef = useFocusTrap();

    const [value, setValue] = useState(props.text);
    const [editing, setEditing] = useState(false);

    let cancelIconColorProp = "#d9480f";
    if ('cancelIconColor' in props){
        cancelIconColorProp = props.cancelIconColor;    
    }
    let okIconColorProp = "#5c940d";
    if ('okIconColor' in props){
        okIconColorProp = props.okIconColor;    
    }

    let displayText = props.text;
    if ('maxDisplayLength' in props){
        if (props.text.length > props.maxDisplayLength){
            displayText = props.text.substring(0,props.maxDisplayLength) + "...";
        }
    }

    //content for Edit field
    let editFieldContent = 
        <Group>
            <Text size={props.size} 
                fw={props.fontWeight} 
                c={props.color} 
                style={{cursor:"pointer"}}
                onClick={()=>setEditing(true)}>{displayText}</Text>    
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
            <TextInput size="sm" 
                    color={props.color}
                    left="0px"
                    value={value} 
                    ref={focusTrapRef}
                    data-autofocus
                    onChange={(event)=>setValue(event.currentTarget.value)}
                    />
            <IconCircleX color={cancelIconColorProp}
                         style={{cursor:"pointer"}}
                         onClick={()=>{
                            setValue(props.text)
                            setEditing(false);
                         }}/>
            <IconCircleCheck color={okIconColorProp} 
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
    cancelIconColor: PropTypes.string,
    okIconColor: PropTypes.string, 
    maxDisplayLength: PropTypes.number,
};