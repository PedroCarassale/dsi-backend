import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memory } from './entities/memory.entity';
import { WorkType } from 'src/trabajos/enums/work-type.enum';
import * as ExcelJS from 'exceljs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

// Helper para convertir color hex a formato ARGB de ExcelJS
const hexToArgb = (hex: string): string => {
  const cleanHex = hex.replace('#', '').toUpperCase();
  return `FF${cleanHex}`;
};

@Injectable()
export class MemoriesService {
  constructor(
    @InjectRepository(Memory)
    private memoryRepository: Repository<Memory>,
  ) {}

  async create(createMemoryDto: CreateMemoryDto): Promise<Memory> {
    const memory = this.memoryRepository.create(createMemoryDto);
    return await this.memoryRepository.save(memory);
  }

  async findAll(): Promise<Memory[]> {
    return await this.memoryRepository.find({
      relations: ['works', 'patents'],
    });
  }

  async findOne(id: string): Promise<Memory> {
    try {
      return await this.memoryRepository.findOneOrFail({
        where: { id },
        relations: ['works', 'patents'],
      });
    } catch {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }
  }

  async update(id: string, updateMemoryDto: UpdateMemoryDto): Promise<Memory> {
    const memory = await this.findOne(id);
    Object.assign(memory, updateMemoryDto);
    return await this.memoryRepository.save(memory);
  }

  async remove(id: string): Promise<void> {
    const memory = await this.findOne(id);
    await this.memoryRepository.remove(memory);
  }

  async exportToExcel(id: string): Promise<ExcelJS.Buffer> {
    const memory = await this.memoryRepository.findOne({
      where: { id },
      relations: ['works', 'patents', 'groups'],
    });

    if (!memory) {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Memoria');

    // Configurar ancho de columnas
    worksheet.columns = [
      { width: 5 }, // A - Nº
      { width: 40 }, // B - Nombre revista / Descripción
      { width: 15 }, // C - País
      { width: 25 }, // D - Editorial
      { width: 20 }, // E - ISSN
      { width: 50 }, // F - Título
    ];

    // Estilos
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'left' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb('#ffff00') } },
    };
    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: 'left' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb('#fbe4d5') } },
    };
    let rowIndex = 1;

    // Título principal
    const groupName = memory.groups?.[0]?.name || 'GRUPO UTN';
    worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
    const titleCell = worksheet.getCell(`A${rowIndex}`);
    titleCell.value = `MEMORIAS ${memory.year} DEL ${groupName}`;
    titleCell.style = headerStyle;
    rowIndex += 2;

    // I.- ADMINISTRACIÓN
    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'I.- ADMINISTRACIÓN';
    worksheet.getCell(`A${rowIndex}`).style = headerStyle;
    rowIndex++;

    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '1.- INDIVIDUALIZACIÓN DEL GRUPO UTN';
    worksheet.getCell(`A${rowIndex}`).style = titleStyle;
    rowIndex++;

    worksheet.getCell(`A${rowIndex}`).value = '1.1.- Facultad Regional: La Plata';
    rowIndex++;

    worksheet.getCell(`A${rowIndex}`).value = `1.2.- Nombre y Sigla: ${groupName}`;
    rowIndex += 2;

    // II.- ACTIVIDADES DE I+D+i
    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'II.- ACTIVIDADES DE I+D+i';
    worksheet.getCell(`A${rowIndex}`).style = headerStyle;
    rowIndex++;

    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '8.- TRABAJOS REALIZADOS Y PUBLICADOS';
    worksheet.getCell(`A${rowIndex}`).style = headerStyle;
    rowIndex++;

    // 8.1.- Trabajos publicados en revistas con referato
    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '8.1.- Trabajos publicados en revistas con referato';
    worksheet.getCell(`A${rowIndex}`).style = titleStyle;
    rowIndex++;

    // Filtrar trabajos
    const articles = memory.works?.filter((w) => w.type === WorkType.ARTICLE) || [];

    // Headers de tabla
    const tableHeaders = ['Nº', 'Nombre de la revista', 'País', 'Editorial', 'ISSN', 'Título trabajo'];
    tableHeaders.forEach((header, idx) => {
      const cell = worksheet.getCell(rowIndex, idx + 1);
      cell.value = header;
      cell.style = titleStyle;
    });
    rowIndex++;

    // Datos de artículos
    if (articles.length > 0) {
      articles.forEach((work, idx) => {
        worksheet.getCell(rowIndex, 1).value = idx + 1;
        worksheet.getCell(rowIndex, 2).value = work.journal || '';
        worksheet.getCell(rowIndex, 3).value = ''; // País - no disponible en la entidad
        worksheet.getCell(rowIndex, 4).value = ''; // Editorial - no disponible en la entidad
        worksheet.getCell(rowIndex, 5).value = work.issn || '';
        worksheet.getCell(rowIndex, 6).value = work.title || '';
        rowIndex++;
      });
    } else {
      worksheet.getCell(`A${rowIndex}`).value = 'No tuvimos en este período.';
      rowIndex++;
    }
    rowIndex++;

    // 8.3.- Libros o capítulos de libros
    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '8.3.- Libros o capítulos de libros';
    worksheet.getCell(`A${rowIndex}`).style = titleStyle;
    rowIndex++;

    const books = memory.works?.filter((w) => w.type === WorkType.BOOK || w.type === WorkType.BOOK_CHAPTER) || [];

    // Headers de tabla de libros
    const bookHeaders = ['Nº', 'Título', 'Autores', 'Editorial', 'ISSN', 'Año'];
    bookHeaders.forEach((header, idx) => {
      const cell = worksheet.getCell(rowIndex, idx + 1);
      cell.value = header;
      cell.style = titleStyle;
    });
    rowIndex++;

    // Datos de libros
    if (books.length > 0) {
      books.forEach((work, idx) => {
        worksheet.getCell(rowIndex, 1).value = idx + 1;
        worksheet.getCell(rowIndex, 2).value = work.title || '';
        worksheet.getCell(rowIndex, 3).value = work.authors?.join(', ') || '';
        worksheet.getCell(rowIndex, 4).value = work.journal || ''; // Editorial
        worksheet.getCell(rowIndex, 5).value = work.issn || '';
        worksheet.getCell(rowIndex, 6).value = work.year || '';
        rowIndex++;
      });
    } else {
      worksheet.getCell(`A${rowIndex}`).value = 'No tuvimos en este período.';
      rowIndex++;
    }
    rowIndex += 2;

    // 9.- REGISTROS Y PATENTES
    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '9.- REGISTROS Y PATENTES';
    worksheet.getCell(`A${rowIndex}`).style = headerStyle;
    rowIndex++;

    // 9.1.- Registro de Propiedad Intelectual
    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '9.1.- Registro de Propiedad Intelectual';
    worksheet.getCell(`A${rowIndex}`).style = titleStyle;
    rowIndex++;

    const intellectualPatents = memory.patents?.filter((p) => p.property === 'Intelectual') || [];

    // Headers de tabla de patentes intelectuales
    const patentHeaders = ['Nº', 'Título', 'Código', 'Descripción', 'Organización', 'Año'];
    patentHeaders.forEach((header, idx) => {
      const cell = worksheet.getCell(rowIndex, idx + 1);
      cell.value = header;
      cell.style = titleStyle;
    });
    rowIndex++;

    // Datos de patentes intelectuales
    if (intellectualPatents.length > 0) {
      intellectualPatents.forEach((patent, idx) => {
        worksheet.getCell(rowIndex, 1).value = idx + 1;
        worksheet.getCell(rowIndex, 2).value = patent.title || '';
        worksheet.getCell(rowIndex, 3).value = patent.code || '';
        worksheet.getCell(rowIndex, 4).value = patent.description || '';
        worksheet.getCell(rowIndex, 5).value = patent.organization || '';
        worksheet.getCell(rowIndex, 6).value = patent.year || '';
        rowIndex++;
      });
    } else {
      worksheet.getCell(`A${rowIndex}`).value = 'No tuvimos en este período.';
      rowIndex++;
    }
    rowIndex++;

    // 9.2.- Registro de Propiedad Industrial
    worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '9.2.- Registro de Propiedad Industrial';
    worksheet.getCell(`A${rowIndex}`).style = titleStyle;
    rowIndex++;

    const industrialPatents = memory.patents?.filter((p) => p.property === 'Industrial') || [];

    // Headers de tabla de patentes industriales
    patentHeaders.forEach((header, idx) => {
      const cell = worksheet.getCell(rowIndex, idx + 1);
      cell.value = header;
      cell.style = titleStyle;
    });
    rowIndex++;

    // Datos de patentes industriales
    if (industrialPatents.length > 0) {
      industrialPatents.forEach((patent, idx) => {
        worksheet.getCell(rowIndex, 1).value = idx + 1;
        worksheet.getCell(rowIndex, 2).value = patent.title || '';
        worksheet.getCell(rowIndex, 3).value = patent.code || '';
        worksheet.getCell(rowIndex, 4).value = patent.description || '';
        worksheet.getCell(rowIndex, 5).value = patent.organization || '';
        worksheet.getCell(rowIndex, 6).value = patent.year || '';
        rowIndex++;
      });
    } else {
      worksheet.getCell(`A${rowIndex}`).value = 'No tuvimos en este período.';
      rowIndex++;
    }

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  async exportToPdf(id: string): Promise<Buffer> {
    const memory = await this.memoryRepository.findOne({
      where: { id },
      relations: ['works', 'patents', 'groups'],
    });

    if (!memory) {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const groupName = memory.groups?.[0]?.name || 'GRUPO UTN';

      // Título principal
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000');
      doc.rect(50, doc.y, 500, 25).fill('#ffff00');
      doc.fillColor('#000000').text(`MEMORIAS ${memory.year} DEL ${groupName}`, 55, doc.y - 20);
      doc.moveDown(1.5);

      // I.- ADMINISTRACIÓN
      doc.rect(50, doc.y, 500, 22).fill('#ffff00');
      doc
        .fillColor('#000000')
        .fontSize(14)
        .text('I.- ADMINISTRACIÓN', 55, doc.y - 17);
      doc.moveDown(1);

      doc.rect(50, doc.y, 400, 20).fill('#fbe4d5');
      doc
        .fillColor('#000000')
        .fontSize(12)
        .text('1.- INDIVIDUALIZACIÓN DEL GRUPO UTN', 55, doc.y - 15);
      doc.moveDown(0.8);

      doc.font('Helvetica').fontSize(11);
      doc.text('1.1.- Facultad Regional: La Plata');
      doc.text(`1.2.- Nombre y Sigla: ${groupName}`);
      doc.moveDown(1);

      // II.- ACTIVIDADES DE I+D+i
      doc.rect(50, doc.y, 500, 22).fill('#ffff00');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('II.- ACTIVIDADES DE I+D+i', 55, doc.y - 17);
      doc.moveDown(1);

      doc.rect(50, doc.y, 500, 22).fill('#ffff00');
      doc.fillColor('#000000').text('8.- TRABAJOS REALIZADOS Y PUBLICADOS', 55, doc.y - 17);
      doc.moveDown(1);

      // 8.1.- Trabajos publicados en revistas
      doc.rect(50, doc.y, 400, 20).fill('#fbe4d5');
      doc
        .fillColor('#000000')
        .fontSize(12)
        .text('8.1.- Trabajos publicados en revistas con referato', 55, doc.y - 15);
      doc.moveDown(0.8);

      const articles = memory.works?.filter((w) => w.type === WorkType.ARTICLE) || [];
      doc.font('Helvetica').fontSize(10);

      if (articles.length > 0) {
        articles.forEach((work, idx) => {
          doc.text(`${idx + 1}. ${work.title}`);
          doc.text(`   Revista: ${work.journal || 'N/A'} | ISSN: ${work.issn || 'N/A'}`, { indent: 20 });
          doc.moveDown(0.3);
        });
      } else {
        doc.text('No tuvimos en este período.');
      }
      doc.moveDown(1);

      // 8.3.- Libros o capítulos de libros
      doc.rect(50, doc.y, 400, 20).fill('#fbe4d5');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('8.3.- Libros o capítulos de libros', 55, doc.y - 15);
      doc.moveDown(0.8);

      const books = memory.works?.filter((w) => w.type === WorkType.BOOK || w.type === WorkType.BOOK_CHAPTER) || [];
      doc.font('Helvetica').fontSize(10);

      if (books.length > 0) {
        books.forEach((work, idx) => {
          doc.text(`${idx + 1}. ${work.title}`);
          doc.text(`   Autores: ${work.authors?.join(', ') || 'N/A'} | Año: ${work.year || 'N/A'}`, { indent: 20 });
          doc.moveDown(0.3);
        });
      } else {
        doc.text('No tuvimos en este período.');
      }
      doc.moveDown(1);

      // 9.- REGISTROS Y PATENTES
      doc.rect(50, doc.y, 500, 22).fill('#ffff00');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('9.- REGISTROS Y PATENTES', 55, doc.y - 17);
      doc.moveDown(1);

      // 9.1.- Registro de Propiedad Intelectual
      doc.rect(50, doc.y, 400, 20).fill('#fbe4d5');
      doc
        .fillColor('#000000')
        .fontSize(12)
        .text('9.1.- Registro de Propiedad Intelectual', 55, doc.y - 15);
      doc.moveDown(0.8);

      const intellectualPatents = memory.patents?.filter((p) => p.property === 'Intelectual') || [];
      doc.font('Helvetica').fontSize(10);

      if (intellectualPatents.length > 0) {
        intellectualPatents.forEach((patent, idx) => {
          doc.text(`${idx + 1}. ${patent.title} (${patent.code})`);
          doc.text(`   Organización: ${patent.organization || 'N/A'} | Año: ${patent.year || 'N/A'}`, { indent: 20 });
          doc.moveDown(0.3);
        });
      } else {
        doc.text('No tuvimos en este período.');
      }
      doc.moveDown(1);

      // 9.2.- Registro de Propiedad Industrial
      doc.rect(50, doc.y, 400, 20).fill('#fbe4d5');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('9.2.- Registro de Propiedad Industrial', 55, doc.y - 15);
      doc.moveDown(0.8);

      const industrialPatents = memory.patents?.filter((p) => p.property === 'Industrial') || [];
      doc.font('Helvetica').fontSize(10);

      if (industrialPatents.length > 0) {
        industrialPatents.forEach((patent, idx) => {
          doc.text(`${idx + 1}. ${patent.title} (${patent.code})`);
          doc.text(`   Organización: ${patent.organization || 'N/A'} | Año: ${patent.year || 'N/A'}`, { indent: 20 });
          doc.moveDown(0.3);
        });
      } else {
        doc.text('No tuvimos en este período.');
      }

      doc.end();
    });
  }
}
