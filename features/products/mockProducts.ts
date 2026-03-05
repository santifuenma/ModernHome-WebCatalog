import { Product } from "./product.types"

export const mockProducts: Product[] = [
    {
        id: "1",
        name: "Dorian",
        slug: "dorian",

        brand: "Novaluna",
        designer: "",

        ambiente: "dormitorio",
        subcategoria: "camas",

        dimensions: [
            "Ancho: 178 cm",
            "Largo: 215 cm",
            "Altura cabecero: 95 cm",
            "Altura base: 35 cm",
            "Tamaño King"
        ],

        materials: [
            "Tapizado textil o semipiel seleccionable",
            "Estructura acolchada",
            "Patas metálicas"
        ],

        images: [
            {
                url: "/icons/dorian-novaluna.jpg",
                alt: "Dorian bed",
                isMain: true
            },
            {
                url: "/icons/dorian-novaluna-2.jpg",
                alt: "Dorian side"
            },
            {
                url: "/icons/dorian-novaluna-3.jpg",
                alt: "Dorian detail"
            }
        ],

        materialSwatches: [
            {
                name: "Tela azul",
                image: "/images/materials/blue.jpg"
            },
            {
                name: "Tela gris",
                image: "/images/materials/grey.jpg"
            }
        ],

        download: {
            name: "Descargar modelo 3D",
            url: "/downloads/dorian.glb"
        }
    }

]