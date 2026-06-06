export async function getCameras() {
  const response = await fetch("http://localhost:5000/cameras");
  return await response.json();
}
