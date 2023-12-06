import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {  Button, Grid, Group, MediaQuery, Space, Text } from "@mantine/core";
import { useLocation } from "react-router-dom";

import { SESSION_EXPIRATION_TIME, getCurrentUser } from "../services/auth";

const PhotoCardGalleryGrid: React.FC<{myCards: boolean, 
                                      myFavorites: boolean,
                                      myFollowees: boolean
                                    }> = (props) => {

    return <div>Main - from PhotoCardGalleryGrid</div>
};

export default PhotoCardGalleryGrid;