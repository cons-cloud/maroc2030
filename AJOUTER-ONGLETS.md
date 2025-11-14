# 🚀 AJOUT DES ONGLETS MANQUANTS

## ✅ **SOLUTION RAPIDE**

Le fichier `PartnerDashboard.tsx` a été remplacé mais il manque les onglets.

**Ajoutez ce code AVANT la ligne 470** (`{/* Produits - Suite dans le prochain message car limite de tokens */}`):

```tsx
{/* ONGLET PRODUITS */}
{activeTab === 'products' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Mes Produits</h3>
    {products.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucun produit pour le moment</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold">{product.title}</h4>
            <p className="text-2xl font-bold text-blue-600 mt-2">{product.price} MAD</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}

{/* ONGLET RÉSERVATIONS */}
{activeTab === 'bookings' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Toutes les Réservations</h3>
    {bookings.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucune réservation</p>
      </div>
    ) : (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">{booking.service_title}</h4>
                <p className="text-sm text-gray-600">{booking.client_name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{booking.amount?.toFixed(2)} MAD</p>
                {getStatusBadge(booking.booking_status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

{/* ONGLET GAINS */}
{activeTab === 'earnings' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Mes Gains</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <h4 className="font-semibold text-yellow-900">En attente</h4>
        <p className="text-3xl font-bold text-yellow-600 mt-2">
          {stats?.pending_earnings?.toFixed(2) || '0.00'} MAD
        </p>
      </div>
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h4 className="font-semibold text-green-900">Reçus</h4>
        <p className="text-3xl font-bold text-green-600 mt-2">
          {stats?.paid_earnings?.toFixed(2) || '0.00'} MAD
        </p>
      </div>
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900">Ce mois</h4>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {stats?.this_month_earnings?.toFixed(2) || '0.00'} MAD
        </p>
      </div>
    </div>
  </div>
)}

{/* ONGLET PROFIL */}
{activeTab === 'profile' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Mon Profil</h3>
    <div className="bg-white border rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Entreprise</label>
          <p className="font-medium">{profile?.company_name || '-'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <p className="font-medium">{user?.email || '-'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Téléphone</label>
          <p className="font-medium">{profile?.phone || '-'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Ville</label>
          <p className="font-medium">{profile?.city || '-'}</p>
        </div>
      </div>
    </div>
  </div>
)}
```

## 📍 **OÙ AJOUTER**

1. Ouvrez `/Users/jamilaaitbouchnani/Maroc-2030/src/Pages/dashboards/PartnerDashboard.tsx`
2. Trouvez la ligne 470 : `{/* Produits - Suite dans le prochain message car limite de tokens */}`
3. **Remplacez cette ligne** par le code ci-dessus
4. Sauvegardez

## ✅ **RÉSULTAT**

Tous les onglets seront fonctionnels :
- ✅ Vue d'ensemble
- ✅ Mes Produits
- ✅ Réservations
- ✅ Mes Gains
- ✅ Profil

**Ajoutez maintenant ce code pour avoir un dashboard 100% fonctionnel !** 🚀
