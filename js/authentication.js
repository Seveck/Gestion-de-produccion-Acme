
export function verificarSesion() {
    const user = localStorage.getItem("user");
    if (!user) {
        window.location.href = "login.html";
    }
}
export function cerrarSesion() {
    localStorage.removeItem("usuarios");
    window.location.href = "login.html";
}