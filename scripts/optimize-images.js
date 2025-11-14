import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { readdir, stat, mkdir } = fs;

const inputDir = join(__dirname, '../public/images');
const outputDir = join(__dirname, '../public/images/optimized');

// Créer le dossier de sortie s'il n'existe pas
async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
    console.log(`Dossier créé: ${dir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`Erreur lors de la création du dossier ${dir}:`, err);
      throw err;
    }
  }
}

// Vérifier si le dossier existe
async function directoryExists(path) {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (err) {
    return false;
  }
}

// Optimiser une image
async function optimizeImage(inputPath, outputPath) {
  try {
    // Créer le dossier de destination s'il n'existe pas
    const outputDir = dirname(outputPath);
    await ensureDir(outputDir);

    // Obtenir les métadonnées de l'image
    const metadata = await sharp(inputPath).metadata();
    
    // Optimiser l'image en fonction de son format
    let image = sharp(inputPath);
    
    // Redimensionner si nécessaire (max 2000px de large)
    if (metadata.width > 2000) {
      image = image.resize({ width: 2000, withoutEnlargement: true });
    }
    
    // Convertir en WebP avec une qualité de 80%
    await image.webp({ quality: 80 }).toFile(outputPath);
    
    console.log(`Optimisé: ${inputPath} -> ${outputPath}`);
  } catch (err) {
    console.error(`Erreur lors de l'optimisation de ${inputPath}:`, err);
  }
}

// Parcourir les fichiers récursivement
async function processDirectory(dir, base = '') {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(base, entry.name);
      
      if (entry.isDirectory()) {
        console.log(`Traitement du dossier: ${fullPath}`);
        await processDirectory(fullPath, relativePath);
      } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
        const outputPath = join(
          outputDir, 
          relativePath.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp')
        );
        
        try {
          const inputStats = await stat(fullPath);
          let shouldOptimize = true;
          
          try {
            const outputStats = await stat(outputPath);
            if (outputStats.mtimeMs >= inputStats.mtimeMs) {
              shouldOptimize = false;
              console.log(`Passage (déjà à jour): ${fullPath}`);
            }
          } catch (err) {
            // Le fichier de sortie n'existe pas, on continue
          }
          
          if (shouldOptimize) {
            console.log(`Traitement de: ${fullPath}`);
            await optimizeImage(fullPath, outputPath);
          }
        } catch (err) {
          console.error(`Erreur lors du traitement de ${fullPath}:`, err);
        }
      }
    }
  } catch (err) {
    console.error(`Erreur lors de la lecture du répertoire ${dir}:`, err);
  }
}

// Démarrer le processus
async function main() {
  try {
    console.log('Début de l\'optimisation des images...');
    
    // Vérifier si le dossier d'entrée existe
    if (!(await directoryExists(inputDir))) {
      console.log(`Le dossier source ${inputDir} n'existe pas. Création...`);
      await ensureDir(inputDir);
      console.log('Veuvez placer vos images dans le dossier public/images pour les optimiser.');
      return;
    }
    
    // Créer le dossier de sortie s'il n'existe pas
    await ensureDir(outputDir);
    
    // Traiter les images
    await processDirectory(inputDir);
    
    console.log('Optimisation des images terminée avec succès !');
    console.log(`Les images optimisées sont disponibles dans: ${outputDir}`);
  } catch (err) {
    console.error('Une erreur est survenue lors de l\'optimisation des images:', err);
    process.exit(1);
  }
}

// Exécuter le script
main();
