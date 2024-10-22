import { useState, useEffect } from "react";

const useItems = ({ url, disabledId = 50, sorted = false, showMessage }) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterId, setFilterId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    getItems();
  }, []);

  useEffect(() => {
    if (items) {
      handleFiltering();
    }
  }, [items, filterId, searchTerm]);

  const getItems = async () => {
    try {
      if (!url) {
        setError("No se ha proporcionado una URL");
        return;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setError("Error al obtener los items");
        return;
      }
      const data = await response.json();
      if (sorted) {
        const sortedData = data.sort();
        setItems(sortedData);
      } else {
        setItems(data);
      }
      setFilteredItems(
        items.filter(
          (item) =>
            item.estado !== "inactivo" &&
            item.estado !== "Inactivo" &&
            item.estado !== "INACTIVO"
        )
      );
    } catch (error) {
      setError(error);
    }
  };

  const handleFiltering = () => {
    let filtered;
    if (filterId === "") {
      filtered = items.filter(
        (item) =>
          item.estado !== "inactivo" &&
          item.estado !== "Inactivo" &&
          item.estado !== "INACTIVO"
      );
    } else if (filterId === disabledId) {
      filtered = items.filter(
        (item) =>
          item.estado === "inactivo" ||
          item.estado === "Inactivo" ||
          item.estado === "INACTIVO"
      );
    } else {
      filtered = items.filter(
        (item) =>
          item.id_tipo === parseInt(filterId) &&
          item.estado !== "inactivo" &&
          item.estado !== "Inactivo" &&
          item.estado !== "INACTIVO"
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const onSubmitPost = async (data) => {
    try {
      const response = await fetch(`${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Error al agregar");
      }
      showMessage("Agregado con éxito", "success");
      await getItems();
    } catch (error) {
      showMessage(error, "error");
    }
  };

  const onSubmitPatch = async (itemId, data) => {
    try {
      if (!itemId && !url) {
        setError("No se ha proporcionado una URL o ID");
        return;
      }
      const response = await fetch(`${url}/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar");
      }
      showMessage("Modificado con éxito", "success");
      await getItems();
    } catch (error) {
      showMessage(error, "error");
    }
  };

  const handleDelete = async (itemId) => {
    try {
      if (!itemId && !url) {
        setError("No se ha proporcionado una URL o ID");
        return;
      }
      const response = await fetch(`${url}/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al eliminar");
      }
      showMessage("Eliminado con éxito", "success");
      await getItems();
    } catch (error) {
      showMessage(error, "error");
    }
  };

  return {
    items,
    filteredItems,
    setFilteredItems,
    filterId,
    setFilterId,
    searchTerm,
    setSearchTerm,
    error,
    getItems,
    onSubmitPost,
    onSubmitPatch,
    handleDelete,
  };
};

export default useItems;
