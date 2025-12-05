import os
import re
import hashlib

# Configuración
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_FILE = os.path.join(BASE_DIR, 'index.html')

def get_file_hash(filepath):
    """Calcula el hash MD5 de un archivo (primeros 8 caracteres)."""
    try:
        with open(filepath, 'rb') as f:
            file_hash = hashlib.md5()
            while chunk := f.read(8192):
                file_hash.update(chunk)
        return file_hash.hexdigest()[:8]
    except FileNotFoundError:
        print(f"Advertencia: Archivo no encontrado: {filepath}")
        return None
    except Exception as e:
        print(f"Error leyendo {filepath}: {e}")
        return None

def process_html():
    print("Iniciando fingerprinting...")
    
    try:
        with open(HTML_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: No se encuentra {HTML_FILE}")
        return

    # Función de reemplazo para re.sub
    def replace_match(match):
        full_tag = match.group(0)
        url = match.group(1)
        
        # Ignorar URLs remotas
        if url.startswith(('http:', 'https:', '//', 'data:')):
            return full_tag
            
        # Limpiar query params existentes
        clean_url = url.split('?')[0]
        file_path = os.path.join(BASE_DIR, clean_url)
        
        # Calcular hash
        file_hash = get_file_hash(file_path)
        
        if file_hash:
            new_url = f"{clean_url}?v={file_hash}"
            return full_tag.replace(url, new_url)
        
        return full_tag

    # Reemplazar CSS: <link ... href="...">
    # Buscamos etiquetas link que tengan rel="stylesheet"
    # Esta regex es simplificada pero funcional para estructuras estándar
    content = re.sub(r'<link[^>]+href="([^"]+)"[^>]*>', replace_match, content)

    # Reemplazar JS: <script ... src="...">
    content = re.sub(r'<script[^>]+src="([^"]+)"[^>]*>', replace_match, content)

    # Guardar cambios
    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"✅ Fingerprinting completado en {HTML_FILE}")

if __name__ == '__main__':
    process_html()
