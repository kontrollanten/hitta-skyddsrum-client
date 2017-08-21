import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GeolocationService } from 'app/shared/geolocation/geolocation.service';
import { Position } from 'models/position.model';
import { GmapsGeocoderService } from 'app/shared/gmaps-geocoder/gmaps-geocoder.service';

@Component({
  templateUrl: './shelters-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheltersSearchComponent implements OnInit {
  public loadingLocation: boolean;
  public searchQuery: string;

  constructor(
    private geoLocationService: GeolocationService,
    private geocoderService: GmapsGeocoderService,
  ) {}

  public ngOnInit(): void {
    this.loadingLocation = true;

    this.geoLocationService.getLocation()
      .flatMap((position) => this.onGeolocationRetrieved(position))
      .subscribe(
        () => this.loadingLocation = false,
        () => this.loadingLocation = false,
      );
  }

  private onGeolocationRetrieved(position: Position) {
    return this.geocoderService.lookupPosition(position)
      .do(results => {
        this.searchQuery = results[0].formatted_address;
      });
  }
}