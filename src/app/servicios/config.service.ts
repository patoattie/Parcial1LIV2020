import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private endPoint = 'https://api.themoviedb.org/3/';
  private urlImg = 'https://image.tmdb.org/t/p/';
  private pelis = 'discover/movie/';
  private programasTV = 'discover/tv/';
  private unaPeli = 'movie/';
  private unPrograma = 'tv/';
  private claveApi = {
    clave: 'api_key',
    valor: '73f9841'.concat('cbba42072').concat('a2e12038').concat('92c07179')
  };
  private ordenPelis = {
    clave: 'sort_by',
    valor: 'popularity.desc'
  };
  private ordenProgramas = {
    clave: 'sort_by',
    valor: 'popularity.desc'
  };
  private idioma = {
    clave: 'language',
    valor: 'es-MX'
  };
  private nroPagina = 1;
  private pagina = {
    clave: 'page',
    valor: this.nroPagina.toString()
  };

  constructor() { }

  public getEndPointPelis() {
    return this.endPoint.concat(this.pelis);
  }

  public getEndPointProgramas() {
    return this.endPoint.concat(this.programasTV);
  }

  public getEndPointUnaPeli(idPeli: string) {
    return this.endPoint.concat(this.unaPeli).concat(idPeli);
  }

  public getEndPointUnPrograma(idPrograma: string) {
    return this.endPoint.concat(this.unPrograma).concat(idPrograma);
  }

  public getClaveApi() {
    return this.claveApi;
  }

  public getOrdenPelis() {
    return this.ordenPelis;
  }

  public getOrdenProgramas() {
    return this.ordenProgramas;
  }

  public getIdioma() {
    return this.idioma;
  }

  public getPagina(pag: number) {
    this.pagina.valor = pag.toString();
    return this.pagina;
  }

  public getUrlImg(img: string, size: number): string {
    return this.urlImg.concat('w').concat(size.toString()).concat(img);
  }
}
