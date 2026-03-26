# Generate simple placeholder PNG icons using ImageMagick or base64
# These are minimal valid PNGs - replace with real icons later
python3 -c "
import struct, zlib

def create_png(size, filename):
    # Create a simple blue circle on transparent background
    width = height = size
    raw = []
    center = size / 2
    radius = size / 2 - 1
    for y in range(height):
        raw.append(0)  # filter byte
        for x in range(width):
            dx, dy = x - center, y - center
            if dx*dx + dy*dy <= radius*radius:
                raw.extend([59, 130, 246, 255])  # brand blue, opaque
            else:
                raw.extend([0, 0, 0, 0])  # transparent
    raw_data = bytes(raw)
    
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(raw_data)
    
    with open(filename, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', idat))
        f.write(chunk(b'IEND', b''))
    print(f'Created {filename}')

create_png(16, 'icons/icon-16.png')
create_png(48, 'icons/icon-48.png')
create_png(128, 'icons/icon-128.png')
"
