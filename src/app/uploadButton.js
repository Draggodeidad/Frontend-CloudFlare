"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ImageIcon from "@mui/icons-material/Image";
import { fetchImages, reloadImages } from "./ImagesContainer";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function InputFileUpload() {
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await fetch(
        "https://back-cloudflare-production.up.railway.app/images/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      console.log("Imagen subida correctamente:", data);

      // Llamar a la función de recarga para actualizar la interfaz
      reloadImages();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Button component="label" variant="contained" startIcon={<ImageIcon />}>
      Subir Imagen
      <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
    </Button>
  );
}
