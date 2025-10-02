// Exemple d'utilisation des hooks POI avec gestion d'erreur
import { usePOIs } from '../hooks/usePOI';
import { ErrorDisplay } from './ErrorDisplay';
import { POIFilters } from '../types/poi';

interface POIListExampleProps {
  filters?: POIFilters;
}

/**
 * Exemple d'utilisation des hooks POI avec gestion d'erreur améliorée
 */
export function POIListExample({ filters = {} }: POIListExampleProps) {
  const { 
    data: pois, 
    error, 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = usePOIs(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Chargement des POIs...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => refetch()}
        className="m-4"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec refresh */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900">
          Points d'Intérêt {pois && `(${pois.length})`}
        </h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isFetching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Actualisation...
            </>
          ) : (
            <>
              🔄 Actualiser
            </>
          )}
        </button>
      </div>

      {/* Liste des POIs */}
      {pois && pois.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pois.map((poi) => (
            <div
              key={poi.id}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                {poi.nom}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                📍 {poi.adresse || 'Adresse non spécifiée'}
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {poi.type}
                </span>
                {poi.telephone && (
                  <span className="text-sm text-gray-500">
                    📞 {poi.telephone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun POI trouvé avec ces filtres.</p>
        </div>
      )}
    </div>
  );
}
