import { jwtDecode } from "jwt-decode";

export const validateToken = async (token) => {
  try {
    if (!token) {
      return { valid: false };
    }

    const response = await fetch("http://localhost:3000/validate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error("Token is invalid:", error);
      return { valid: false };
    }

    if (
      decodedToken.role === "admin" ||
      decodedToken.role === "client" ||
      decodedToken.role === "doctor"
    ) {
      return { valid: true, role: decodedToken.role };
    } else {
      return { valid: false };
    }
  } catch (error) {
    console.error("Error validating token:", error);
    return { valid: false };
  }
};
