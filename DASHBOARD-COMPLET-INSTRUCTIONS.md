# 🎯 DASHBOARD PARTENAIRE COMPLET - INSTRUCTIONS

## 📋 **OBJECTIF**

Créer un dashboard partenaire **100% fonctionnel** avec tous les onglets actifs :
- ✅ Vue d'ensemble (Overview)
- ✅ Mes Produits (Products) - Gestion complète
- ✅ Réservations (Bookings) - Liste complète
- ✅ Mes Gains (Earnings) - Détails financiers
- ✅ Profil (Profile) - Informations partenaire

---

## 🚀 **SOLUTION RAPIDE**

### **OPTION 1 : Utiliser PartnerDashboardComplete.tsx**

Le fichier `PartnerDashboardComplete.tsx` existe déjà et contient une version plus complète.

**Commandes à exécuter** :

```bash
cd /Users/jamilaaitbouchnani/Maroc-2030/src/Pages/dashboards
rm PartnerDashboard.tsx
cp PartnerDashboardComplete.tsx PartnerDashboard.tsx
```

Puis modifiez le fichier pour renommer le composant :
- Ligne 75 : `PartnerDashboardComplete` → `PartnerDashboard`
- Ligne 478 : `export default PartnerDashboardComplete` → `export default PartnerDashboard`

---

## 📝 **OPTION 2 : Compléter Manuellement**

### **1. ONGLET PRODUITS (Products)**

Ajoutez après l'onglet Overview (ligne ~360) :

```tsx
{/* ONGLET PRODUITS */}
{activeTab === 'products' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">
        Tous mes produits
      </h3>
      <button
        onClick={() => toast('Formulaire de création à venir', { icon: 'ℹ️' })}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Nouveau produit
      </button>
    </div>

    {products.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucun produit pour le moment</p>
        <p className="text-sm text-gray-400 mt-2">
          Créez votre premier produit pour commencer à recevoir des réservations
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-200">
              {product.main_image ? (
                <img
                  src={product.main_image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Package className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.available ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
              <p className="text-sm text-gray-500 mb-2">{product.product_type}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{product.city}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-blue-600">
                  {product.price} MAD
                </span>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {product.bookings_count || 0}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toast('Fonction à venir', { icon: 'ℹ️' })}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  {product.available ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => toast('Édition à venir', { icon: 'ℹ️' })}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toast('Suppression à venir', { icon: 'ℹ️' })}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

### **2. ONGLET RÉSERVATIONS (Bookings)**

```tsx
{/* ONGLET RÉSERVATIONS */}
{activeTab === 'bookings' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">
      Toutes les réservations
    </h3>
    {bookings.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucune réservation</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Votre gain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{booking.service_title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{booking.client_name}</div>
                  <div className="text-sm text-gray-500">{booking.client_email}</div>
                  <div className="text-sm text-gray-500">{booking.client_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Du: {new Date(booking.start_date).toLocaleDateString('fr-FR')}</div>
                  <div>Au: {new Date(booking.end_date).toLocaleDateString('fr-FR')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">
                    {booking.amount?.toFixed(2)} MAD
                  </div>
                  <div className="text-xs text-gray-500">(90% du total)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.booking_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.partner_paid ? (
                    <div>
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Reçu
                      </span>
                      {booking.partner_paid_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(booking.partner_paid_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Clock className="w-4 h-4" />
                      En attente
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
```

### **3. ONGLET GAINS (Earnings)**

```tsx
{/* ONGLET GAINS */}
{activeTab === 'earnings' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Mes gains
    </h3>

    {/* Résumé des gains */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-yellow-600" />
          <h4 className="font-semibold text-yellow-900">En attente</h4>
        </div>
        <p className="text-3xl font-bold text-yellow-600">
          {stats?.pending_earnings?.toFixed(2) || '0.00'} MAD
        </p>
        <p className="text-sm text-yellow-700 mt-2">
          Réservations confirmées non encore payées
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h4 className="font-semibold text-green-900">Reçus</h4>
        </div>
        <p className="text-3xl font-bold text-green-600">
          {stats?.paid_earnings?.toFixed(2) || '0.00'} MAD
        </p>
        <p className="text-sm text-green-700 mt-2">
          Total des paiements reçus
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Ce mois</h4>
        </div>
        <p className="text-3xl font-bold text-blue-600">
          {stats?.this_month_earnings?.toFixed(2) || '0.00'} MAD
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Gains du mois en cours
        </p>
      </div>
    </div>

    {/* Explication commission */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h4>
      <ul className="space-y-2 text-sm text-blue-800">
        <li>• Maroc2030 prélève 10% de commission sur chaque réservation</li>
        <li>• Vous recevez 90% du montant total payé par le client</li>
        <li>• Les paiements sont effectués mensuellement</li>
        <li>• Les gains "En attente" seront payés après confirmation du service</li>
      </ul>
    </div>

    {/* Liste des gains récents */}
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">Historique des paiements</h4>
      {bookings.filter(b => b.partner_paid).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun paiement reçu pour le moment</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.filter(b => b.partner_paid).map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{booking.service_title}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    {booking.amount?.toFixed(2)} MAD
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {booking.partner_paid_at ? new Date(booking.partner_paid_at).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Payé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}
```

### **4. ONGLET PROFIL (Profile)**

```tsx
{/* ONGLET PROFIL */}
{activeTab === 'profile' && (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Mon profil partenaire
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Informations générales */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Informations générales
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Nom de l'entreprise</label>
            <p className="font-medium text-gray-900">{profile?.company_name || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium text-gray-900">{user?.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Téléphone</label>
            <p className="font-medium text-gray-900">{profile?.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Ville</label>
            <p className="font-medium text-gray-900">{profile?.city || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Type de service</label>
            <p className="font-medium text-gray-900">{profile?.partner_type || '-'}</p>
          </div>
        </div>
      </div>

      {/* Informations financières */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Informations financières
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Commission</label>
            <p className="font-medium text-gray-900">{profile?.commission_rate || 10}%</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Compte bancaire</label>
            <p className="font-medium text-gray-900">{profile?.bank_account || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">IBAN</label>
            <p className="font-medium text-gray-900">{profile?.iban || 'Non renseigné'}</p>
          </div>
        </div>
        <button
          onClick={() => toast('Modification du profil à venir', { icon: 'ℹ️' })}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Modifier mes informations
        </button>
      </div>
    </div>

    {/* Statistiques du compte */}
    <div className="bg-white border rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Statistiques du compte
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600">Produits actifs</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.active_products || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Réservations totales</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.total_bookings || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Gains totaux</p>
          <p className="text-2xl font-bold text-green-600">{stats?.total_earnings?.toFixed(0) || 0} MAD</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Note moyenne</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.average_rating?.toFixed(1) || '0.0'} ⭐</p>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## ✅ **IMPORTS NÉCESSAIRES**

Ajoutez ces imports en haut du fichier :

```tsx
import {
  Package,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Edit,
  Trash2,
  Eye,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  TrendingUp
} from 'lucide-react';
```

---

## ✅ **VARIABLES D'ÉTAT NÉCESSAIRES**

Ajoutez ces variables d'état :

```tsx
const [products, setProducts] = useState<Product[]>([]);
```

Et dans `loadDashboardData()`, ajoutez :

```tsx
// Charger les produits
const { data: productsData, error: productsError } = await supabase
  .from('partner_products')
  .select('*')
  .eq('partner_id', user?.id)
  .order('created_at', { ascending: false});

if (productsError) {
  console.error('Erreur produits:', productsError);
} else {
  setProducts(productsData || []);
}
```

---

## 🎯 **RÉSULTAT FINAL**

Après ces modifications, votre dashboard partenaire aura :
- ✅ **Overview** : Réservations récentes
- ✅ **Produits** : Grille de produits avec actions
- ✅ **Réservations** : Tableau complet avec détails
- ✅ **Gains** : Résumé financier + historique
- ✅ **Profil** : Informations partenaire + statistiques

---

**Suivez ces instructions pour compléter votre dashboard partenaire !** 🚀
