"use client";
import * as React from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import CloseIcon from "@mui/icons-material/Close";
import Crop32Icon from "@mui/icons-material/Crop32";
import {
  Dialog,
  IconButton,
  Button,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

// Función para obtener la lista de imágenes
export const fetchImages = async () => {
  try {
    const response = await axios.get(
      "https://back-cloudflare-production.up.railway.app/images/list"
    );
    if (response.data && response.data.result) {
      return response.data.result.images || [];
    }
    return [];
  } catch (error) {
    console.error("Error al cargar las imágenes:", error);
    return [];
  }
};

// Referencia a la función de recarga (se configurará desde el componente principal)
let reloadImagesFunction = null;

// Función para exportar que permite recargar las imágenes desde cualquier componente
export const reloadImages = () => {
  if (reloadImagesFunction) {
    reloadImagesFunction();
    return true;
  }
  return false;
};

export default function ImageContainer() {
  const [open, setOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [selectedImageId, setSelectedImageId] = React.useState(null);
  const [resolution, setResolution] = React.useState("original");
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Función para cargar las imágenes
  const loadImages = async () => {
    setLoading(true);
    const imageList = await fetchImages();
    setImages(imageList);
    setLoading(false);
  };

  // Configurar la función de recarga para que esté disponible externamente
  React.useEffect(() => {
    reloadImagesFunction = loadImages;

    // Limpiar la referencia cuando el componente se desmonte
    return () => {
      reloadImagesFunction = null;
    };
  }, []);

  // Cargar imágenes al montar el componente
  React.useEffect(() => {
    loadImages();
  }, []);

  const handleClickOpen = (image, imageId) => {
    setSelectedImage(image);
    setSelectedImageId(imageId);
    setResolution("original"); // Aseguramos que siempre se abra en original
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
    setSelectedImageId(null);
    setResolution("original");
  };

  const handleResolutionChange = (newResolution) => {
    setResolution(newResolution);
  };

  const handleDelete = async () => {
    if (!selectedImageId) return;

    try {
      await axios.delete(
        `https://back-cloudflare-production.up.railway.app/images/delete/${selectedImageId}`
      );
      // Actualizar la lista de imágenes después de eliminar
      loadImages();
      handleClose();
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
    }
  };

  // Función para obtener la URL de la variante según la resolución
  const getVariantUrl = (image, resolution) => {
    if (!image || !image.variants) return "";

    // Si es resolución original, usar la primera variante por defecto
    if (resolution === "original") return image.variants[0];

    // Buscar la variante específica según la resolución
    const resolutionMap = {
      SD: "250",
      HD: "500",
      "4K": "750",
    };

    // Buscar entre las variantes
    const variantUrl = image.variants.find((url) =>
      url.includes(`/${resolutionMap[resolution]}`)
    );

    // Si se encontró la variante específica, usarla; de lo contrario, usar la original
    return variantUrl || image.variants[0];
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      ) : images.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <Typography variant="body1">No hay imágenes disponibles</Typography>
        </Box>
      ) : (
        <ImageList
          sx={{
            width: "100%",
            height: 450,
            overflowY: "auto",
          }}
          variant="quilted"
          cols={3}
          rowHeight={200}
          gap={8}
        >
          {images.map((image) => (
            <ImageListItem
              key={image.id}
              onClick={() => handleClickOpen(image, image.id)}
              sx={{
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                },
              }}
            >
              <img
                src={getVariantUrl(image, "SD")}
                alt={image.filename || "Image"}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        Width="10.5vh"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#1a1a1a",
          },
        }}
      >
        {/* Botón de cerrar */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            zIndex: 1,
            bgcolor: "rgba(0,0,0,0.5)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <CloseIcon style={{ color: "#FFFFFF" }} />
        </IconButton>

        {/* Botón de borrar */}
        <IconButton
          onClick={handleDelete}
          sx={{
            position: "absolute",
            left: 10,
            top: 10,
            zIndex: 1,
            bgcolor: "rgba(0,0,0,0.5)",
            "&:hover": { bgcolor: "rgba(255,0,0,0.2)" },
          }}
        >
          <DeleteIcon style={{ color: "#FF0000" }} />
        </IconButton>

        {/* Contenedor de la imagen */}
        <DialogContent
          sx={{
            padding: 0,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh", // Aumentamos la altura para aprovechar mejor el espacio
            bgcolor: "#1a1a1a",
          }}
        >
          {selectedImage && (
            <img
              src={getVariantUrl(selectedImage, resolution)}
              alt="Imagen ampliada"
              style={{
                width: resolution === "original" ? "auto" : "auto",
                height: resolution === "original" ? "auto" : "auto",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: resolution === "original" ? "contain" : "contain",
              }}
            />
          )}
        </DialogContent>

        {/* Contenedor para los botones de resolución */}
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: "12px",
            backgroundColor: "#2a2a2a",
          }}
        >
          {/* <Button
            variant={resolution === "original" ? "contained" : "outlined"}
            onClick={() => handleResolutionChange("original")}
            startIcon={<Crop32Icon />}
            sx={{
              margin: "0 8px",
              bgcolor: resolution === "original" ? "#3a82f7" : "transparent",
              color: resolution === "original" ? "white" : "#3a82f7",
              "&:hover": {
                bgcolor:
                  resolution === "original"
                    ? "#2563eb"
                    : "rgba(58, 130, 247, 0.1)",
              },
            }}
          >
            Original
          </Button> */}
          <Button
            variant={resolution === "SD" ? "contained" : "outlined"}
            onClick={() => handleResolutionChange("SD")}
            startIcon={<Crop32Icon />}
            sx={{
              margin: "0 8px",
              bgcolor: resolution === "SD" ? "#3a82f7" : "transparent",
              color: resolution === "SD" ? "white" : "#3a82f7",
              "&:hover": {
                bgcolor:
                  resolution === "SD" ? "#2563eb" : "rgba(58, 130, 247, 0.1)",
              },
            }}
          >
            250px
          </Button>
          <Button
            variant={resolution === "HD" ? "contained" : "outlined"}
            onClick={() => handleResolutionChange("HD")}
            startIcon={<Crop32Icon />}
            sx={{
              margin: "0 8px",
              bgcolor: resolution === "HD" ? "#3a82f7" : "transparent",
              color: resolution === "HD" ? "white" : "#3a82f7",
              "&:hover": {
                bgcolor:
                  resolution === "HD" ? "#2563eb" : "rgba(58, 130, 247, 0.1)",
              },
            }}
          >
            500px
          </Button>
          <Button
            variant={resolution === "4K" ? "contained" : "outlined"}
            onClick={() => handleResolutionChange("4K")}
            startIcon={<Crop32Icon />}
            sx={{
              margin: "0 8px",
              bgcolor: resolution === "4K" ? "#3a82f7" : "transparent",
              color: resolution === "4K" ? "white" : "#3a82f7",
              "&:hover": {
                bgcolor:
                  resolution === "4K" ? "#2563eb" : "rgba(58, 130, 247, 0.1)",
              },
            }}
          >
            750px
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
